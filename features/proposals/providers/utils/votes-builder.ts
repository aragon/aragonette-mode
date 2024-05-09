import { PUB_CHAIN, PUB_MULTISIG_ADDRESS } from "@/constants";
import { getSnapshotVotesData } from "../snapshot/votes";
import { getMultisigVotesData } from "../multisig/votes";
import { ProposalStages } from "../../services";
import { type Vote } from "@/features/proposals/providers/utils/types";
import { Address } from "viem";
import VercelCache from "@/services/cache/VercelCache";
import { type IProposalVote, type IProposal } from "@/features/proposals";
import { printStageParam } from "@/utils/api-utils";

export async function getVotes(providerId: string, stage: ProposalStages): Promise<Vote[]> {
  switch (stage) {
    case ProposalStages.DRAFT: {
      return [];
    }
    case ProposalStages.COUNCIL_APPROVAL: {
      const multisigVotes = await getMultisigVotesData({
        chain: PUB_CHAIN.id,
        contractAddress: PUB_MULTISIG_ADDRESS,
        providerId: BigInt(providerId),
      });

      return multisigVotes;
    }
    case ProposalStages.COMMUNITY_VOTING: {
      const snapshotVotes = await getSnapshotVotesData({ providerId });

      return snapshotVotes;
    }
    case ProposalStages.COUNCIL_CONFIRMATION: {
      const multisigVotes = await getMultisigVotesData({
        chain: PUB_CHAIN.id,
        contractAddress: PUB_MULTISIG_ADDRESS,
        providerId: BigInt(providerId),
      });

      return multisigVotes;
    }
    default: {
      throw new Error("Invalid stage");
    }
  }
}

const parseVotesData = (data: Vote[]): IProposalVote[] => {
  return data.map((vote) => {
    return {
      id: vote.id,
      address: vote.voter as Address,
      vote: vote.choice,
      amount: Number(vote.amount),
      timestamp: vote.timestamp,
    };
  });
};

export async function buildVotesResponse(providerId: string, proposalStage: ProposalStages): Promise<IProposalVote[]> {
  const proposalVotes = await getVotes(providerId, proposalStage);

  return parseVotesData(proposalVotes);
}

export async function getCachedVotes(proposalId: string, stageEnum: ProposalStages): Promise<IProposalVote[]> {
  const cache = new VercelCache();

  const proposals = await cache.get<IProposal[]>(`proposals`);
  const proposal = proposals?.find((p) => p.pip === `PIP-${proposalId}`);

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  const stage = proposal.stages.find((s) => s.id === stageEnum);

  if (!stage) {
    throw new Error("Stage not found");
  }

  let votes: IProposalVote[] = [];
  if (stage.voting) {
    if (stage.status === "active") {
      // Fresh votes
      votes = await buildVotesResponse(stage.voting.providerId, stage.id);
    } else {
      // Cached votes
      votes =
        (await cache.get<IProposalVote[]>(`votes-PIP-${proposalId}-${printStageParam(stageEnum)}`)) ??
        (await buildVotesResponse(stage.voting.providerId, stage.id));
    }
  }

  return votes;
}
