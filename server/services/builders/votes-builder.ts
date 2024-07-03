import { PUB_CHAIN, PUB_MULTISIG_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import { type IProposalVote, type IVoted } from "@/features/proposals";
import { ProposalStages } from "@/features/proposals/services";
import { type Vote } from "@/server/models/proposals/types";
import { logger } from "@/services/logger";
import { type Address } from "viem";
import { type IVotingData } from "@/features/proposals/services";
import { getMultisigVotingPower } from "@/services/rpc/multisig/utils";
import { getMultisigApprovalData, getMultisigConfirmationData } from "@/services/rpc/multisig/votes";
import { getSnapshotVotes, getSnapshotVotingPower } from "@/services/snapshot/votes";

export async function getVotes(
  providerId: string,
  choices: string[],
  stage: ProposalStages,
  voter?: Address
): Promise<Vote[]> {
  logger.info(`Fetching votes for proposalId (${providerId}-${stage})...`);
  switch (stage) {
    case ProposalStages.DRAFT:
    case ProposalStages.TRANSPARENCY_REPORT: {
      return [];
    }
    case ProposalStages.COUNCIL_APPROVAL: {
      const multisigVotes = await getMultisigApprovalData({
        chain: PUB_CHAIN.id,
        contractAddress: PUB_MULTISIG_ADDRESS,
        providerId: BigInt(providerId),
      });

      if (voter) {
        return multisigVotes.filter((vote) => vote.voter === voter);
      }

      return multisigVotes;
    }
    case ProposalStages.COMMUNITY_VOTING: {
      const votes = await getSnapshotVotes({
        space: SNAPSHOT_SPACE,
        providerId,
        voter,
      });

      return votes.map((vote) => {
        const currChoices = choices || ["approve", "reject"];
        const choiceIndex = parseInt(vote.choice);
        const choice = isNaN(choiceIndex) ? vote.choice : currChoices[choiceIndex - 1];
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

      if (voter) {
        return multisigVotes.filter((vote) => vote.voter === voter);
      }

      return multisigVotes;
    }
    default: {
      throw new Error(`Invalid stage: ${stage}`);
    }
  }
}

export async function getVotingPower(stage: ProposalStages, address: string, providerId?: string): Promise<number> {
  logger.info(`Fetching voting power for address (${address}) in proposal (${providerId}-${stage})...`);
  switch (stage) {
    case ProposalStages.DRAFT:
    case ProposalStages.TRANSPARENCY_REPORT: {
      return 0;
    }
    case ProposalStages.COUNCIL_APPROVAL: {
      return getMultisigVotingPower(PUB_CHAIN.id, PUB_MULTISIG_ADDRESS, address, providerId, false);
    }
    case ProposalStages.COMMUNITY_VOTING: {
      return getSnapshotVotingPower({
        space: SNAPSHOT_SPACE,
        voter: address,
        providerId,
      });
    }
    case ProposalStages.COUNCIL_CONFIRMATION: {
      return getMultisigVotingPower(PUB_CHAIN.id, PUB_MULTISIG_ADDRESS, address, providerId, true);
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

export async function buildVotesResponse(
  votingData: IVotingData,
  proposalStage: ProposalStages
): Promise<IProposalVote[]> {
  logger.info(`Fetching votes for proposalId (${votingData.providerId}-${proposalStage})...`);
  const proposalVotes = await getVotes(votingData.providerId, votingData.choices, proposalStage);

  return parseVotesData(proposalVotes);
}

export async function buildVotedResponse(
  votingData: IVotingData,
  proposalStage: ProposalStages,
  voter: Address
): Promise<IVoted> {
  logger.info(`Fetching votes for proposalId (${votingData.providerId}-${proposalStage})...`);
  const addressVotes = await getVotes(votingData.providerId, votingData.choices, proposalStage, voter);

  return {
    address: voter,
    hasVoted: addressVotes.length > 0,
  };
}

export async function buildVotingPowerResponse(
  stage: ProposalStages,
  address: string,
  proposalId?: string
): Promise<number> {
  logger.info(`Fetching voting power for address (${address}) in proposal (${proposalId}-${stage})...`);
  return getVotingPower(stage, address, proposalId);
}
