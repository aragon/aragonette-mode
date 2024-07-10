import { ProposalStages } from "@/features/proposals/services";

export const parseStageParam = (stage: string): ProposalStages => {
  switch (stage) {
    case "draft":
      return ProposalStages.DRAFT;
    case "transparency-report":
      return ProposalStages.TRANSPARENCY_REPORT;
    case "council-approval":
      return ProposalStages.COUNCIL_APPROVAL;
    case "community-voting":
      return ProposalStages.COMMUNITY_VOTING;
    case "council-confirmation":
      return ProposalStages.COUNCIL_CONFIRMATION;
    default:
      throw new Error("Invalid stage");
  }
};
