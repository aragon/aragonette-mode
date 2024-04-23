import { type IProposalDataListItemStructureProps } from "@aragon/ods";
import { ProposalStages, ProposalTypes, type IProposal } from "../../services";

type ProposalListItem = IProposalDataListItemStructureProps & { id: string };

export function toProposalDataListItems(proposals: IProposal[]): ProposalListItem[] {
  return proposals.map((proposal) => {
    const { pip, status, type, stages, currentStage, description, title } = proposal;

    // get active stage
    const stageIndex = stages.findIndex((stage) => stage.id === currentStage)!;
    const activeStage = stages[stageIndex];

    // pick the draft state creator unless proposal is critical
    const originalCreators = type === ProposalTypes.CRITICAL ? stages[1].creator : stages[0].creator;
    const publisher = originalCreators.map((creator) => ({ ...creator, address: "" }));

    // only community voting is mjv; draft has no voting data
    const isMajorityVoting = activeStage.id === ProposalStages.COMMUNITY_VOTING;

    return {
      // TODO - map date relative to status
      date: status === "active" ? undefined : activeStage.startTimestamp,
      id: `PIP-${pip}`,
      type: isMajorityVoting ? "majorityVoting" : "approvalThreshold",
      tag: type,
      publisher,
      status,
      summary: description,
      title,
      voted: false,
      result: {
        ...activeStage.voting,
        stage: {
          id: stageIndex,
          title: activeStage.title,
        },
      },
    };
  }) as Array<ProposalListItem>;
}
