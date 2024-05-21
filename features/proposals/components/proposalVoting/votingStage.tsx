import { PUB_CHAIN } from "@/constants";
import { getSimpleRelativeTimeFromDate } from "@/utils/dates";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemHeader,
  Heading,
  Tabs,
  formatterUtils,
  type IApprovalThresholdResult,
} from "@aragon/ods";
import { Tabs as RadixTabsRoot } from "@radix-ui/react-tabs";
import dayjs from "dayjs";
import { useRef, useState, type CSSProperties } from "react";
import { type ProposalStages } from "../../services";
import { VotesDataList } from "../votesDataList/votesDataList";
import { VotingBreakdown, type IVotingBreakdownCta } from "./votingBreakdown";
import { VotingDetails } from "./votingDetails";
import { VotingStageStatus } from "./votingStageStatus";

export interface IVotingStageDetails {
  censusBlock: number;
  startDate: string;
  endDate: string;
  strategy: string;
  options: string;
}

export interface IVotingStageResults extends IApprovalThresholdResult {}

export interface IVotingStageProps {
  title: string;
  number: number;
  disabled: boolean;
  status: "accepted" | "rejected" | "active";

  proposalId?: string;
  result?: IApprovalThresholdResult;
  details?: IVotingStageDetails;
  cta?: IVotingBreakdownCta;
}

export const VotingStage: React.FC<IVotingStageProps> = (props) => {
  const { cta, details, disabled, title, number, result, proposalId = "", status } = props;

  const [collapsibleHeight, setCollapsibleHeight] = useState<CSSProperties["height"]>();
  const contentRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);

  // TODO: replace with resizeObserver
  const updateHeight = () => {
    requestAnimationFrame(() => {
      if (tabRef.current) {
        setCollapsibleHeight(`${tabRef.current.offsetHeight}px`);
      }
    });
  };

  const resetHeight = () => {
    if (collapsibleHeight != null) setCollapsibleHeight(undefined);
  };

  const defaultTab = status === "active" ? "breakdown" : "details";
  const stageKey = `Stage ${number}`;
  const formattedSnapshotBlock = formatterUtils.formatNumber(details?.censusBlock) ?? "";
  const snapshotBlockURL = `${PUB_CHAIN.blockExplorers?.default.url}/block/${details?.censusBlock}`;
  const contentStyles = collapsibleHeight
    ? ({ ["--radix-collapsible-content-height"]: collapsibleHeight } as CSSProperties)
    : undefined;

  return (
    <AccordionItem
      key={stageKey}
      value={stageKey}
      disabled={disabled}
      className="border-t border-t-neutral-100 bg-neutral-0"
    >
      <AccordionItemHeader className="!items-start !gap-y-5" onClick={resetHeight}>
        <div className="flex w-full gap-x-6">
          <div className="flex flex-1 flex-col items-start gap-y-2">
            <Heading size="h3" className="line-clamp-1 text-left">
              {title}
            </Heading>
            <VotingStageStatus status={status} endDate={getSimpleRelativeTimeFromDate(dayjs(details?.endDate))} />
          </div>
          <span className="hidden leading-tight text-neutral-500 sm:block">{stageKey}</span>
        </div>
      </AccordionItemHeader>

      <AccordionItemContent ref={contentRef} style={contentStyles} asChild={true} className="!md:pb-0 !pb-0">
        <RadixTabsRoot defaultValue={defaultTab} ref={tabRef} onValueChange={updateHeight}>
          <Tabs.List>
            <Tabs.Trigger value="breakdown" label="Breakdown" />
            <Tabs.Trigger value="voters" label="Voters" />
            <Tabs.Trigger value="details" label="Details" />
          </Tabs.List>
          <Tabs.Content value="breakdown" asChild={true}>
            <div className="py-4 pb-8">{result && <VotingBreakdown cta={cta} result={result} />}</div>
          </Tabs.Content>
          <Tabs.Content value="voters">
            <div className="py-4 pb-8">
              <VotesDataList proposalId={proposalId} stageId={title as ProposalStages} />
            </div>
          </Tabs.Content>
          <Tabs.Content value="details">
            <div className="py-4 pb-8">
              {details && (
                <VotingDetails
                  snapshotBlock={formattedSnapshotBlock}
                  startDate={details.startDate}
                  endDate={details.endDate}
                  snapshotBlockURL={snapshotBlockURL}
                  strategy={details.strategy}
                  options={details.options}
                />
              )}
            </div>
          </Tabs.Content>
        </RadixTabsRoot>
      </AccordionItemContent>
    </AccordionItem>
  );
};
