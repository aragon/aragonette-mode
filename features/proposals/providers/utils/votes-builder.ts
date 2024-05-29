import { PUB_CHAIN, PUB_MULTISIG_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import proposalRepository from "@/features/proposals/repository/proposal";
import { type IProposalVote } from "@/features/proposals";
import { type Vote } from "@/features/proposals/models/proposals";
import VercelCache from "@/services/cache/VercelCache";
import { type Address } from "viem";
import { ProposalStages } from "../../services";
import { getMultisigConfirmationData, getMultisigVotesData } from "../multisig/votes";
import { getCanApprove } from "../multisig/utils";
import { getSnapshotProposalStageData } from "../snapshot/proposalStages";
import { getSnapshotVotesData, getSnapshotVotingPower } from "../snapshot/votes";

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
      const snapshotProposalData = await getSnapshotProposalStageData({ proposalId: providerId });

      return snapshotVotes.map((vote) => {
        const choices = snapshotProposalData?.voting?.choices || ["approve", "reject"];
        const choiceIndex = parseInt(vote.choice);
        const choice = isNaN(choiceIndex) ? vote.choice : choices[choiceIndex - 1];
        return {
          ...vote,
          choice: choice,
        };
      });
    }
    case ProposalStages.COUNCIL_CONFIRMATION: {
      const multisigVotes = await getMultisigConfirmationData({
        chain: PUB_CHAIN.id,
        contractAddress: PUB_MULTISIG_ADDRESS,
        providerId: BigInt(providerId),
      });

      return multisigVotes;
    }
    default: {
      throw new Error(`Invalid stage: ${stage}`);
    }
  }
}

export async function getVotingPower(providerId: string, stage: ProposalStages, address: string): Promise<number> {
  switch (stage) {
    case ProposalStages.DRAFT: {
      return 0;
    }
    case ProposalStages.COUNCIL_APPROVAL: {
      return getCanApprove(PUB_CHAIN.id, PUB_MULTISIG_ADDRESS, providerId, address).then((canVote) =>
        canVote ? 1 : 0
      );
    }
    case ProposalStages.COMMUNITY_VOTING: {
      return getSnapshotVotingPower({
        space: SNAPSHOT_SPACE,
        providerId,
        voter: address,
      });
    }
    case ProposalStages.COUNCIL_CONFIRMATION: {
      //TODO: Use getCanConfirm
      return getCanApprove(PUB_CHAIN.id, PUB_MULTISIG_ADDRESS, providerId, address).then((canVote) =>
        canVote ? 1 : 0
      );
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

export async function buildVotingPowerResponse(
  proposalId: string,
  stage: ProposalStages,
  address: string
): Promise<number> {
  return getVotingPower(proposalId, stage, address);
}

export async function getCachedVotes(proposalId: string, stageEnum: ProposalStages): Promise<IProposalVote[]> {
  const cache = new VercelCache();

  const proposal = await proposalRepository.getProposalById(proposalId);

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  const stage = proposal.stages.find((s) => s.id === `${proposal.id}-${stageEnum}`);

  if (!stage) {
    throw new Error("Stage not found");
  }

  let votes: IProposalVote[] = [];

  if (stage.voting) {
    votes = await buildVotesResponse(stage.voting.providerId, stage.type);

    // TODO: Save to database
  }

  return votes;
}
