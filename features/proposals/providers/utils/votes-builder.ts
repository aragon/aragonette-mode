import { PUB_CHAIN, PUB_MULTISIG_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import { type IProposalVote } from "@/features/proposals";
import { type Vote } from "@/features/proposals/models/proposals";
import { type Address } from "viem";
import { ProposalStages } from "../../services";
import { getMultisigVotingPower } from "../multisig/utils";
import { getMultisigApprovalData, getMultisigConfirmationData } from "../multisig/votes";
import { getSnapshotProposalStageData } from "../snapshot/proposalStages";
import { getSnapshotVotesData, getSnapshotVotingPower } from "../snapshot/votes";

export async function getVotes(providerId: string, stage: ProposalStages): Promise<Vote[]> {
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

export async function getVotingPower(stage: ProposalStages, address: string, providerId?: string): Promise<number> {
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
  const proposalVotes = await getVotes(providerId, proposalStage);

  return parseVotesData(proposalVotes);
}

export async function buildVotingPowerResponse(
  stage: ProposalStages,
  address: string,
  proposalId?: string
): Promise<number> {
  return getVotingPower(stage, address, proposalId);
}
