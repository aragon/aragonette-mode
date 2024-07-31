import { AccordionContainer, Card, Heading } from "@aragon/ods";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import React from "react";
import { type ITransformedStage } from "../../services/selectors";
import { VotingStage, type IVotingStageProps } from "./votingStage/votingStage";
import { ProposalStages } from "../../services";

dayjs.extend(utc);
dayjs.extend(relativeTime);

interface IProposalVotingProps {
  stages: ITransformedStage[];
  isEmergency: boolean;
}

export const ProposalVoting: React.FC<IProposalVotingProps> = ({ isEmergency, stages }) => {
  return (
    <Card className="overflow-hidden rounded-xl bg-neutral-0 shadow-neutral">
      {/* Header */}
      <div className="flex flex-col gap-y-2 p-6">
        <Heading size="h2">Voting</Heading>
        {!isEmergency && (
          <p className="text-lg leading-normal text-neutral-500">
            The proposal must first pass the Protocol Council Approval, then the community must vote in favour, and then
            the Protocol Council confirms the onchain actions.
          </p>
        )}
        {isEmergency && (
          <p className="text-lg leading-normal text-neutral-500">
            The Protocol Council must reach the required super-majority threshold in order to execute any onchain
            actions.
          </p>
        )}
      </div>
      {/* Stages */}
      <VotingStage
        key={ProposalStages.COMMUNITY_VOTING}
        {...({
          ...stages.find((stage) => stage.type === ProposalStages.COMMUNITY_VOTING),
          number: 0,
        } as IVotingStageProps)}
      />
    </Card>
  );
};
