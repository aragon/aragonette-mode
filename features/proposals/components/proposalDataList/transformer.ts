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
    const originalCreators =
      type === ProposalTypes.CRITICAL
        ? stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.creator
        : stages.find((stage) => stage.id === ProposalStages.DRAFT)?.creator;

    const publisher = originalCreators?.map((creator) => ({ address: "", ...creator }));

    // only community voting is mjv; draft has no voting data
    const isMajorityVoting = activeStage.id === ProposalStages.COMMUNITY_VOTING;
    const result =
      status !== "draft" ? { ...activeStage.voting, stage: { id: stageIndex, title: activeStage.title } } : undefined;

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
      result,
    };
  }) as Array<ProposalListItem>;
}
