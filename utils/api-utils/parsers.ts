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

export const printStageParam = (stage: ProposalStages): string => {
  switch (stage) {
    case ProposalStages.DRAFT:
      return "draft";
    case ProposalStages.TRANSPARENCY_REPORT:
      return "transparency-report";
    case ProposalStages.COUNCIL_APPROVAL:
      return "council-approval";
    case ProposalStages.COMMUNITY_VOTING:
      return "community-voting";
    case ProposalStages.COUNCIL_CONFIRMATION:
      return "council-confirmation";
    default:
      throw new Error("Invalid stage");
  }
};
