import PrismaDatabase from "@/services/database/PrismaDatabase";
import { IProposal } from "..";
import { type IPaginatedResponse } from "@/utils/types";
import { type ProposalStatus } from "../services/proposal/domain";
import { parseProposal, serializeProposals, serializeStages, parseStage } from "./utils";
import { logger } from "@/services/logger";

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
    case "draft":
      return ["draft", "Last Call", "Continuous", "Stagnant", "Peer Review"];
    case "active":
      return ["active", "challenged", "queued", "pending"];
    case "accepted":
      return ["accepted", "partiallyExecuted", "executed"];
    case "rejected":
      return ["rejected", "vetoed", "failed", "expired"];
    default:
      throw new Error(`Invalid status value: ${value}`);
  }
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
      if (search) {
        where = {
          title: {
            search: search,
          },
          description: {
            search: search,
          },
          body: {
            search: search,
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

      let orderBy = {};
      if (sortBy === ProposalSortBy.Title) {
        orderBy = { title: sortDir };
      } else if (sortBy === ProposalSortBy.Status) {
        orderBy = { status: sortDir };
      } else if (sortBy === ProposalSortBy.IsEmergency) {
        orderBy = { isEmergency: sortDir };
      } else if (sortBy === ProposalSortBy.CreatedAt) {
        orderBy = { createdAt: sortDir };
      }

      if (limit < 1 || limit > 100) {
        limit = 10;
      }

      if (page < 1) {
        page = 1;
      }

      if (page > Math.ceil(totalProposals / limit)) {
        page = Math.ceil(totalProposals / limit);
      }

      const proposals = await PrismaDatabase.proposal.findMany({
        relationLoadStrategy: "join",
        skip: limit * (page - 1),
        take: limit,
        orderBy,
        where,
        include: {
          Stages: true,
        },
      });

      const proposalsWithStages = proposals.map((proposal) => {
        return {
          ...parseProposal(proposal),
          stages: proposal.Stages.map(parseStage),
        };
      });

      return {
        data: proposalsWithStages,
        pagination: {
          total: totalProposals,
          page,
          pages: Math.ceil(totalProposals / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error("Error fetching proposals from database:", error);
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
        for (const stage of stagesData) {
          if (proposal.Stages.find((s) => s.id === stage.id)) {
            await PrismaDatabase.stage.update({
              where: { id: stage.id },
              data: stage,
            });
          } else {
            await PrismaDatabase.stage.create({
              data: {
                ...stage,
                proposal: {
                  connect: {
                    id: proposalData.id,
                  },
                },
              },
            });
          }
        }
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
