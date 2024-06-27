import { PUB_CHAIN, PUB_MULTISIG_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import { type IProposalVote } from "@/features/proposals";
import { type Vote } from "@/server/models/proposals/types";
import { type Address } from "viem";
import { ProposalStages } from "../../../features/proposals/services";
import { getMultisigVotingPower } from "../../../services/rpc/multisig/utils";
import { getMultisigApprovalData, getMultisigConfirmationData } from "../../../services/rpc/multisig/votes";
import { getSnapshotProposalStage } from "../../../services/snapshot/proposalStages";
import { getSnapshotVotes, getSnapshotVotingPower } from "../../../services/snapshot/votes";
import { logger } from "@/services/logger";

export async function getVotes(providerId: string, stage: ProposalStages): Promise<Vote[]> {
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

      return multisigVotes;
    }
    case ProposalStages.COMMUNITY_VOTING: {
      const snapshotVotes = await getSnapshotVotes({ providerId });
      const snapshotProposal = await getSnapshotProposalStage({ proposalId: providerId });

      return snapshotVotes.map((vote) => {
        const choices = snapshotProposal?.voting?.choices || ["approve", "reject"];
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

export async function buildVotesResponse(providerId: string, proposalStage: ProposalStages): Promise<IProposalVote[]> {
  logger.info(`Fetching votes for proposalId (${providerId}-${proposalStage})...`);
  const proposalVotes = await getVotes(providerId, proposalStage);

  return parseVotesData(proposalVotes);
}

export async function buildVotingPowerResponse(
  stage: ProposalStages,
  address: string,
  proposalId?: string
): Promise<number> {
  logger.info(`Fetching voting power for address (${address}) in proposal (${proposalId}-${stage})...`);
  return getVotingPower(stage, address, proposalId);
}
