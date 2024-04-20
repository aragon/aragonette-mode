import { type IProposalDataListItemStructureProps } from "@aragon/ods";
import { ProposalStages, ProposalTypes, type IProposal } from "../../services";

type ProposalListItem = IProposalDataListItemStructureProps & { id: string };

export function toProposalDataListItems(proposals: IProposal[]): ProposalListItem[] {
  return proposals.map((proposal) => {
    const stageIndex = proposal.stages.findIndex((s) => s.id === proposal.currentStage)!;
    const stage = proposal.stages[stageIndex];
    const publisherString =
      proposal.type === ProposalTypes.CRITICAL ? proposal.stages[1].creator : proposal.stages[0].creator;
    const publishers = publisherString.split(",").map((publisher) => ({ name: publisher, address: "" }));

    const commonProps = {
      id: proposal.pip,
      date: proposal.status === "active" ? undefined : stage.startTimestamp,
      tag: proposal.type,
      publisher: publishers,
      status: proposal.status,
      summary: proposal.description,
      title: `${proposal.pip} ${proposal.title}`,
      voted: false,
    };

    const isMajorityVoting = stage.id === ProposalStages.COMMUNITY_VOTING;
    if (isMajorityVoting) {
      return {
        ...commonProps,
        type: "majorityVoting",
        result: {
          ...stage.voting,
          stageId: stageIndex.toString(),
          stageTitle: stage.title,
        },
      } as ProposalListItem;
    } else {
      return {
        ...commonProps,
        type: "approvalThreshold",
        result: {
          ...stage.voting,
          stageId: stageIndex.toString(),
          stageTitle: stage.title,
        },
      } as ProposalListItem;
    }
  });
}
