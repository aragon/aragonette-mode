import { PROPOSAL_PREFIX } from "@/constants";
import PrismaDatabase from "@/services/database/PrismaDatabase";
import { type IPaginatedResponse } from "@/utils/types";
import {
  type IProposal,
  StageOrder,
  ProposalStatus,
  ProposalStages,
} from "../../../features/proposals/services/domain";
import { parseProposal, serializeProposals, serializeStages, parseStage } from "./utils";
import { logger } from "@/services/logger";
import { type StageType } from "@prisma/client";
import { checkPaginationParams } from "@/utils/pagination";

export enum ProposalSortBy {
  Title = "title",
  Status = "status",
  IsEmergency = "isEmergency",
  CreatedAt = "createdAt",
  //StartsAt = 'startsAt', // TODO: Implement stages.startsAt sorting
  //EndsAt = 'endsAt',
}

export const parseProposalSortBy = (value?: string): ProposalSortBy => {
  if (!value) {
    return ProposalSortBy.CreatedAt;
  }

  switch (value) {
    case "title":
      return ProposalSortBy.Title;
    case "status":
      return ProposalSortBy.Status;
    case "isEmergency":
      return ProposalSortBy.IsEmergency;
    case "createdAt":
      return ProposalSortBy.CreatedAt;
    default:
      throw new Error(`Invalid sort by value: ${value}`);
  }
};

export enum ProposalSortDir {
  Asc = "asc",
  Desc = "desc",
}

export const parseProposalSortDir = (value?: string): ProposalSortDir => {
  if (!value) {
    return ProposalSortDir.Desc;
  }

  if (value === "asc") {
    return ProposalSortDir.Asc;
  } else if (value === "desc") {
    return ProposalSortDir.Desc;
  } else {
    throw new Error(`Invalid sort direction value: ${value}`);
  }
};

export const parsedProposalStatus = (value?: string): ProposalStatus[] => {
  if (!value) {
    return [];
  }

  switch (value) {
    case "active":
      return [ProposalStatus.ACTIVE];
    case "rejected":
      return [ProposalStatus.REJECTED];
    case "executed":
      return [ProposalStatus.EXECUTED];
    case "pending":
      return [ProposalStatus.PENDING];
    case "expired":
      return [ProposalStatus.EXPIRED];
    default:
      throw new Error(`Invalid status value: ${value}`);
  }
};

export const parseStageType = (stage: StageType): ProposalStages => {
  switch (stage) {
    case "DRAFT":
      return ProposalStages.DRAFT;
    case "TRANSPARENCY_REPORT":
      return ProposalStages.TRANSPARENCY_REPORT;
    case "COMMUNITY_VOTING":
      return ProposalStages.COMMUNITY_VOTING;
    case "COUNCIL_APPROVAL":
      return ProposalStages.COUNCIL_APPROVAL;
    case "COUNCIL_CONFIRMATION":
      return ProposalStages.COUNCIL_CONFIRMATION;
    default:
      throw new Error(`Invalid stage value: ${stage}`);
  }
};

export const serializeStageType = (stage: ProposalStages): StageType => {
  switch (stage) {
    case ProposalStages.DRAFT:
      return "DRAFT";
    case ProposalStages.TRANSPARENCY_REPORT:
      return "TRANSPARENCY_REPORT";
    case ProposalStages.COMMUNITY_VOTING:
      return "COMMUNITY_VOTING";
    case ProposalStages.COUNCIL_APPROVAL:
      return "COUNCIL_APPROVAL";
    case ProposalStages.COUNCIL_CONFIRMATION:
      return "COUNCIL_CONFIRMATION";
    default:
      throw new Error(`Invalid stage value: ${stage}`);
  }
};

const getImprovedSearch = (search?: string) => {
  if (!search) {
    return null;
  }
  const parsedSearch = search.trim();
  const intSearch = parseInt(parsedSearch);
  if (Number.isNaN(intSearch)) {
    return search;
  }
  return intSearch > 9 ? `${PROPOSAL_PREFIX}-${intSearch}` : `${PROPOSAL_PREFIX}-0${intSearch}`;
};

class ProposalRepository {
  async getProposals(
    page: number,
    limit: number,
    sortBy: ProposalSortBy,
    sortDir: ProposalSortDir,
    search?: string,
    status?: ProposalStatus[]
  ): Promise<IPaginatedResponse<IProposal>> {
    try {
      let where = {};
      const improvedSearch = getImprovedSearch(search);
      if (improvedSearch) {
        where = {
          id: {
            search: improvedSearch,
          },
          title: {
            search: improvedSearch,
          },
          description: {
            search: improvedSearch,
          },
          body: {
            search: improvedSearch,
          },
        };
      }

      if (status && status.length > 0) {
        where = {
          ...where,
          status: {
            in: status,
          },
        };
      }

      const totalProposals = await PrismaDatabase.proposal.count({ where });
      if (totalProposals === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            pages: 1,
            limit: 10,
          },
        };
      }

      let orderBy: any = {};
      if (search) {
        orderBy = {
          _relevance: {
            fields: ["id", "title", "description", "body"],
            search: improvedSearch,
            sort: "desc",
          },
          createdAt: "desc",
        };
      } else {
        if (sortBy === ProposalSortBy.Title) {
          orderBy = { title: sortDir };
        } else if (sortBy === ProposalSortBy.Status) {
          orderBy = { status: sortDir };
        } else if (sortBy === ProposalSortBy.IsEmergency) {
          orderBy = { isEmergency: sortDir };
        } else if (sortBy === ProposalSortBy.CreatedAt) {
          orderBy = { createdAt: sortDir };
        }
      }

      const { page: pageV, limit: limitV, pages: pagesV } = checkPaginationParams(page, limit, totalProposals);

      const proposals = await PrismaDatabase.proposal.findMany({
        relationLoadStrategy: "join",
        skip: limitV * (pageV - 1),
        take: limitV,
        orderBy,
        where,
        include: {
          Stages: true,
        },
      });

      const proposalsWithStages: IProposal[] = proposals.map((proposal) => {
        return {
          ...parseProposal(proposal),
          stages: proposal.Stages.map(parseStage).sort((a, b) => {
            return StageOrder[a.type] - StageOrder[b.type];
          }),
        };
      });

      return {
        data: proposalsWithStages,
        pagination: {
          total: totalProposals,
          page: pageV,
          pages: pagesV,
          limit: limitV,
        },
      };
    } catch (error) {
      logger.error("Error fetching proposals from database:", error);
      throw error;
    }
  }

  async getProposalByStage(providerId: string, stageType: ProposalStages) {
    try {
      const stageDbType = serializeStageType(stageType);
      const stage = await PrismaDatabase.stage.findFirst({
        where: { type: stageDbType, voting: { contains: `"providerId":"${providerId}"` } },
      });

      if (stage == null) {
        logger.warn(`No stage found with providerId ${providerId} and stageType ${stageType}`);
        return null;
      }

      return await this.getProposalById(stage.proposalId);
    } catch (error) {
      logger.error(`Error fetching proposal with providerId ${providerId} and stageType ${stageType}:`, error);
      throw error;
    }
  }

  async getProposalById(id: string): Promise<IProposal | null> {
    try {
      const proposal = await PrismaDatabase.proposal.findUnique({
        where: { id },
        include: {
          Stages: true,
        },
      });

      if (!proposal) {
        return null;
      } else {
        return {
          ...parseProposal(proposal),
          stages: proposal.Stages.map(parseStage),
        };
      }
    } catch (error) {
      logger.error(`Error fetching proposal with ID ${id}:`, error);
      throw error;
    }
  }

  async upsertProposal(proposalData: IProposal) {
    try {
      const data = serializeProposals(proposalData);
      const stagesData = serializeStages(proposalData.id, proposalData.stages);

      let proposal = await PrismaDatabase.proposal.findUnique({
        where: { id: proposalData.id },
        include: { Stages: true },
      });

      if (proposal) {
        const promises = [];
        for (const stage of stagesData) {
          if (proposal.Stages.find((s) => s.id === stage.id)) {
            promises.push(
              PrismaDatabase.stage.update({
                where: { id: stage.id },
                data: stage,
              })
            );
          } else {
            promises.push(
              PrismaDatabase.stage.create({
                data: {
                  ...stage,
                  proposal: {
                    connect: {
                      id: proposalData.id,
                    },
                  },
                },
              })
            );
          }
        }
        await Promise.all(promises);
        proposal = await PrismaDatabase.proposal.update({
          where: { id: proposalData.id },
          data: {
            ...data,
          },
          include: { Stages: true },
        });
      } else {
        proposal = await PrismaDatabase.proposal.create({
          data: {
            ...data,
            Stages: {
              createMany: {
                data: stagesData,
              },
            },
          },
          include: { Stages: true },
        });
      }

      return proposal;
    } catch (error) {
      logger.error("Error creating proposal:", error);
      throw error;
    }
  }
}

export default new ProposalRepository();
