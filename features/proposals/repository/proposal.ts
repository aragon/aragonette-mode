import PrismaDatabase from "@/services/database/PrismaDatabase";
import { IProposal } from "..";
import { parseProposal, serializeProposals, serializeStages, parseStage } from "./utils";

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

  if (value === "title") {
    return ProposalSortBy.Title;
  } else if (value === "status") {
    return ProposalSortBy.Status;
  } else if (value === "isEmergency") {
    return ProposalSortBy.IsEmergency;
  } else if (value === "createdAt") {
    return ProposalSortBy.CreatedAt;
  }

  {
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

class ProposalRepository {
  async countProposals(): Promise<number> {
    try {
      const count = await PrismaDatabase.proposal.count();
      return count;
    } catch (error) {
      console.error("Error counting proposals:", error);
      throw error;
    }
  }

  async getProposals(
    page: number,
    limit: number,
    sortBy: ProposalSortBy,
    sortDir: ProposalSortDir,
    query?: string
  ): Promise<IProposal[]> {
    try {
      let where = {};
      if (query) {
        where = {
          title: {
            search: query,
          },
          description: {
            search: query,
          },
          body: {
            search: query,
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

      return proposals.map((proposal) => {
        return {
          ...parseProposal(proposal),
          stages: proposal.Stages.map(parseStage),
        };
      });
    } catch (error) {
      console.error("Error fetching proposals from database:", error);
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
      console.error(`Error fetching proposal with ID ${id}:`, error);
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
      console.error("Error creating proposal:", error);
      throw error;
    }
  }
}

export default new ProposalRepository();
