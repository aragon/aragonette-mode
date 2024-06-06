import { PUB_TOKEN_SYMBOL } from "@/constants";
import { ProposalStages } from "@/features/proposals/services";
import { proposalVotes } from "@/features/proposals/services/proposal/query-options";
import { AvatarIcon, IconType, NumberFormat, formatterUtils } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type ContentType } from "recharts/types/component/Tooltip";

interface IDynamicVetoRateChart {
  proposalId: string;
}

export const DynamicVetoRateChart: React.FC<IDynamicVetoRateChart> = (props) => {
  const { proposalId } = props;

  const { data: votesData } = useInfiniteQuery({
    ...proposalVotes({ proposalId, stage: ProposalStages.COMMUNITY_VOTING }),
  });

  if (votesData == null || votesData.votes.length === 0) {
    return null;
  }

  const totalVotes = votesData?.pagination.total;
  const totalSupply = 15000; // TODO: fetch total supply

  let yesTotal = 0;
  let noTotal = 0;

  // TODO generate from backend
  const dataPoints = generateDataPoints(
    votesData?.votes.map((vote) => {
      if (vote.choice === "yes") {
        yesTotal += Number(vote.votingPower?.split(" ")[0]);
      } else if (vote.choice === "no") {
        noTotal += Number(vote.votingPower?.split(" ")[0]);
      }
      return { yes: yesTotal, no: noTotal };
    }) ?? [],
    totalSupply
  );

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral-sm">
      <div className="flex flex-col gap-y-6">
        <div className="flex gap-x-6">
          <div className="flex flex-1 flex-col gap-y-2">
            <p className="text-lg leading-tight text-neutral-800">Dynamic Veto Rate</p>
            <p className="text-base leading-tight text-neutral-500">
              Total amount of <span className="text-neutral-800">No</span> votes required
            </p>
          </div>
          <div className="flex gap-x-2">
            <span className="text-lg leading-tight text-neutral-800">{`≥${dataPoints[dataPoints.length - 1].minimumRate}%`}</span>
            <AvatarIcon size="sm" icon={IconType.CLOSE} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={254} className="">
          <AreaChart data={dataPoints} className="" margin={{ left: -12 }}>
            <defs>
              <linearGradient id="colorMinimumRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B3FE4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7B3FE4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickFormatter={(value) =>
                `${formatterUtils.formatNumber(value, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}`
              }
              dataKey="tokenAmount"
              className="text-xs"
              domain={[dataPoints[0].tokenAmount, dataPoints[dataPoints.length - 1].tokenAmount]}
              tickLine={false}
              axisLine={false}
              tickCount={6}
              type="number"
            />
            <YAxis
              tickFormatter={(value) =>
                `≥${formatterUtils.formatNumber(value / 100, { format: NumberFormat.PERCENTAGE_SHORT })}`
              }
              className="text-xs"
              domain={[dataPoints[0].minimumRate, dataPoints[dataPoints.length - 1].minimumRate]}
              tickLine={false}
              axisLine={false}
              tickCount={5}
              type="number"
              dataKey="minimumRate"
            />
            <Tooltip content={renderContent} cursor={false} />
            <Area
              type="monotone"
              dataKey="minimumRate"
              stroke="rgb(var(--ods-color-primary-500))"
              fillOpacity={1}
              fill="url(#colorMinimumRate)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-y-2">
          <div className="flex-gap-x-1 flex">
            <p className="text-lg leading-tight text-primary-500">
              {formatterUtils.formatNumber(totalVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
              <span className="text-neutral-800">{` of ${formatterUtils.formatNumber(totalSupply, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`}</span>
            </p>
          </div>
          <p className="text-neutral-500">
            The amount of participation determines the Dynamic Veto Rate. The required veto threshold increases with
            decreasing participation (total amount of <span className="text-neutral-800">No</span> votes).
          </p>
        </div>
      </div>
    </div>
  );
};

type VotingDataPoint = {
  tokenAmount: number;
  minimumRate: number;
  noVotes: number;
  neededNoVotes: number;
  requiredNoVotesLeft: number;
};

const renderContent: ContentType<string[], string> = ({ active, payload }) => {
  if (!active || !payload?.length) return undefined;

  const { minimumRate, noVotes, neededNoVotes, requiredNoVotesLeft } = payload[0].payload;

  return (
    <div className="flex flex-col gap-y-2 rounded-xl border border-primary-500 bg-neutral-0 p-3 shadow-tooltip">
      <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
        <p className="flex-1">Minimum Rate</p>
        <p className="font-semibold text-neutral-800">{`≥${minimumRate}%`}</p>
      </div>
      <div className="flex flex-col gap-y-[3.64px]">
        <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
          <p className="flex-1">Needed No votes</p>
          <p className="font-semibold text-neutral-800">{`>${formatterUtils.formatNumber(neededNoVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`}</p>
        </div>
        <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
          <p className="flex-1">Current No votes</p>
          <p className="font-semibold text-neutral-800">{`${formatterUtils.formatNumber(noVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`}</p>
        </div>
        <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
          <p className="flex-1">Required No votes left</p>
          <p className="font-semibold text-neutral-800">{`>${formatterUtils.formatNumber(requiredNoVotesLeft, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`}</p>
        </div>
      </div>
    </div>
  );
};

function isProposalVetoed(noVotes: number, totalSupply: number, yesVotes: number): boolean {
  // formula: noVotes / sqrt(totalSupply) > yesVotes / sqrt(yesVotes + noVotes)
  return noVotes / Math.sqrt(totalSupply) > yesVotes / Math.sqrt(yesVotes + noVotes);
}

function calculateDynamicVetoRate(noVotes: number, turnout: number): number {
  // formula: noVotes / turnout
  return noVotes / turnout;
}

function calculateNoVotesForVeto(yesVotes: number, totalSupply: number): number {
  return Math.sqrt(totalSupply) - yesVotes;
}

function generateDataPoints(votes: { yes: number; no: number }[], totalSupply: number): VotingDataPoint[] {
  const data = votes.map(({ yes, no }) => {
    const turnout = yes + no;
    const vetoed = isProposalVetoed(no, totalSupply, yes);
    const noVotesForVeto = calculateNoVotesForVeto(yes, totalSupply);

    return {
      tokenAmount: turnout,
      minimumRate: Math.ceil(calculateDynamicVetoRate(no, turnout) * 100),
      noVotes: no,
      neededNoVotes: noVotesForVeto,
      requiredNoVotesLeft: vetoed || no > noVotesForVeto ? 0 : noVotesForVeto - no,
    };
  });

  return data;
}
