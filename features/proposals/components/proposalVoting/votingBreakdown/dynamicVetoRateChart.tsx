import { PUB_TOKEN_SYMBOL } from "@/constants";
import { ProposalStages } from "@/features/proposals/services";
import { proposalVotes } from "@/features/proposals/services/query-options";
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

  if (votesData == null || votesData.votes.length <= 1) {
    return null;
  }

  let yesTotal = 0;
  let noTotal = 0;

  const totalSupply = 3000000; // TODO: fetch total supply

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

  const totalVotes = yesTotal + noTotal;

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral-sm">
      <div className="flex flex-col gap-y-6">
        <div className="flex gap-x-6">
          <div className="flex flex-1 flex-col gap-y-2">
            <p className="text-lg leading-tight text-neutral-800">
              Percentage of <span className="text-neutral-900">Yes</span> votes
            </p>
          </div>
          <div className="flex gap-x-2">
            <span className="text-lg leading-tight text-neutral-800">{`${formatterUtils.formatNumber(dataPoints[dataPoints.length - 1].totalVotes / dataPoints[dataPoints.length - 1].totalSupply, { format: NumberFormat.PERCENTAGE_SHORT })}`}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={254} className="">
          <AreaChart data={dataPoints} className="" margin={{ left: -12 }}>
            <defs>
              <linearGradient id="colorpercentage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B3FE4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7B3FE4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickFormatter={(value) =>
                `${formatterUtils.formatNumber(value, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}`
              }
              dataKey="totalVotes"
              className="text-xs"
              domain={[dataPoints[0].totalVotes, dataPoints[dataPoints.length - 1].totalVotes]}
              tickLine={false}
              axisLine={false}
              tickCount={6}
              type="number"
            />
            <YAxis
              tickFormatter={(value) =>
                `${formatterUtils.formatNumber(value / 100, { format: NumberFormat.PERCENTAGE_SHORT })}`
              }
              className="text-xs"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickCount={5}
              type="number"
              dataKey="percentage"
            />
            <Tooltip content={renderContent} cursor={false} />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="rgb(var(--ods-color-primary-500))"
              fillOpacity={1}
              fill="url(#colorpercentage)"
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
        </div>
      </div>
    </div>
  );
};

type VotingDataPoint = {
  totalSupply: number;
  totalVotes: number;
  percentage: number;
  noVotes: number;
  yesVotes: number;
};

const renderContent: ContentType<string[], string> = ({ active, payload }) => {
  if (!active || !payload?.length) return undefined;

  const { percentage, noVotes, yesVotes, totalVotes } = payload[0].payload;

  return (
    <div className="flex flex-col gap-y-2 rounded-xl border border-primary-500 bg-neutral-0 p-3 shadow-tooltip">
      <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
        <p className="flex-1">Total votes</p>
        <p className="font-semibold text-neutral-800">{`${formatterUtils.formatNumber(totalVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}`}</p>
      </div>
      <div className="flex flex-col gap-y-[3.64px]">
        <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
          <p className="flex-1">Yes votes</p>
          <p className="font-semibold text-neutral-800">{`${formatterUtils.formatNumber(yesVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`}</p>
        </div>
        <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
          <p className="flex-1">No votes</p>
          <p className="font-semibold text-neutral-800">{`${formatterUtils.formatNumber(noVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`}</p>
        </div>
        <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
          <p className="flex-1">Percetage</p>
          <p className="font-semibold text-neutral-800">{`${formatterUtils.formatNumber(percentage / 100, { format: NumberFormat.PERCENTAGE_SHORT })}`}</p>
        </div>
      </div>
    </div>
  );
};

function generateDataPoints(votes: { yes: number; no: number }[], totalSupply: number): VotingDataPoint[] {
  const data = votes.map(({ yes, no }) => {
    const totalVotes = yes + no;

    return {
      totalSupply,
      totalVotes,
      percentage: (yes / totalVotes) * 100,
      noVotes: no,
      yesVotes: yes,
    };
  });

  return data;
}
