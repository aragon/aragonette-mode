import { IProposalStageProvider, ProposalStage } from "@/features/proposals/providers/utils/types";
import { ProposalStages } from "@/features/proposals/services/proposal/domain";
import { requestProposalData } from "./queries";
import { MultisigProposal } from "./types";
import { Address } from "viem";
import { PUB_CHAIN } from "@/constants";

function parseMultisigData(proposals?: MultisigProposal[]): ProposalStage[] {
  if (!proposals) return [];

  return proposals.map((proposal) => {
    const bindings = [];

    if (proposal.githubId) {
      bindings.push({
        id: ProposalStages.DRAFT,
        link: proposal.githubId,
      });
    }

    if (proposal.snapshotId) {
      bindings.push({
        id: ProposalStages.COMMUNITY_VOTING,
        link: proposal.snapshotId,
      });
    }

    const voting = proposal.voting && {
      startDate: proposal.voting.startDate,
      endDate: proposal.voting.endDate,
      approvals: proposal.voting.approvals,
      quorum: proposal.voting.quorum,
      snapshotBlock: proposal.voting.snapshotBlock,
      choices: ["approve"],
      scores: [
        {
          choice: "approve",
          votes: proposal.voting.approvals,
          percentage: (proposal.voting.approvals / proposal.voting.quorum) * 100,
        },
      ],
      total_votes: proposal.voting.approvals,
    };

    const creator = [
      {
        link: `${PUB_CHAIN.blockExplorers?.default.url}/address/${proposal.creator}`,
        address: proposal.creator,
      },
    ];

    return {
      id: proposal.id,
      title: proposal.title,
      description: proposal.summary,
      body: proposal.description,
      status: proposal.status,
      creator,
      link: proposal.link,
      voting,
      actions: proposal.actions,
      bindings,
    };
  });
}

export const getMultisigProposalData: IProposalStageProvider = async function (params: {
  chain: number;
  contractAddress: Address;
}) {
  const data = await requestProposalData(params.chain, params.contractAddress);
  return parseMultisigData(data);
};
