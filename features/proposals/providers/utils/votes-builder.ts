import { PUB_CHAIN, PUB_MULTISIG_ADDRESS } from "@/constants";
import { IProposalVote } from "@/features/proposals";
import { getSnapshotVotesData } from "../snapshot/votes";
import { getMultisigVotesData } from "../multisig/votes";
import { ProposalStages } from "../../services";
import { type Vote } from "@/features/proposals/providers/utils/types";
import { Address } from "viem";
import { getProposalStages, matchProposalStages } from "./proposal-builder";

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

export async function buildVotesResponse(proposalId: string, proposalStage: ProposalStages): Promise<IProposalVote[]> {
  // This is needed while we don't have a proper way to get the proposals and stages from the store (cache)
  const proposalStages = await getProposalStages();
  const allMatchedProposalStages = await matchProposalStages(proposalStages);
  const currentProposal = allMatchedProposalStages.find((stage) => stage.some((s) => s.pip === proposalId));
  const currentStage = currentProposal ? currentProposal.find((stage) => stage.id === proposalStage) : null;
  const providerId = currentStage?.voting?.providerId;

  if (!providerId) {
    return [];
  }

  const proposalVotes = await getVotes(providerId, proposalStage);

  return parseVotesData(proposalVotes);
}
