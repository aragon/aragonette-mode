import { useMemo } from "react";
import { Avatar, DataListItem, DateFormat, formatterUtils, NumberFormat, Tag } from "@aragon/ods";
import { VotingDialog } from "../voting-dialog";
import { type GaugeItem } from "../gauges-list/types";
import { Token } from "../../types/tokens";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";
import { formatUnits } from "viem";
import { useGetUsedVp } from "../../hooks/useGetUsedVp";
import { useAccount } from "wagmi";
import { useNow } from "../../hooks/useNow";
import { useGetVotingEndsIn } from "../../hooks/useGetVotingEndsIn";
import { useGetVotingStartsIn } from "../../hooks/useGetVotingStartsIn";

type VotingBarProps = {
  selectedGauges: GaugeItem[];
  onRemove: (gauge: GaugeItem) => void;
};

export const VotingBar: React.FC<VotingBarProps> = ({ selectedGauges, onRemove }) => {
  const { now, getRelativeTime } = useNow();
  const { isConnected } = useAccount();

  const { ownedTokens: modeOwnedTokensData } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptOwnedTokensData } = useOwnedTokens(Token.BPT);

  const { votingStartsIn } = useGetVotingStartsIn(Token.MODE, BigInt(Math.floor(now / 1000)));
  const { votingEndsIn } = useGetVotingEndsIn(Token.MODE, BigInt(Math.floor(now / 1000)));

  const active = useMemo(() => !!votingEndsIn && !votingStartsIn, [votingEndsIn, votingStartsIn]);

  const nextVoteIn = useMemo(
    () => getRelativeTime(Number(active ? votingEndsIn : (votingStartsIn ?? 0n)) * 1000 + now, DateFormat.RELATIVE),
    [active, getRelativeTime, now, votingEndsIn, votingStartsIn]
  );

  const modeOwnedTokens = [...(modeOwnedTokensData ?? [])];
  const bptOwnedTokens = [...(bptOwnedTokensData ?? [])];

  const { data: usedModeVp } = useGetUsedVp(Token.MODE, modeOwnedTokens);
  const { data: usedBptVp } = useGetUsedVp(Token.BPT, bptOwnedTokens);

  const { vp: modeVpBn } = useGetAccountVp(Token.MODE);
  const { vp: bptVpBn } = useGetAccountVp(Token.BPT);

  if (!isConnected) {
    return null;
  }

  const hasVp = !(modeVpBn === 0n && bptVpBn === 0n);

  const modeVp = formatUnits(modeVpBn ?? 0n, 18);
  const bptVp = formatUnits(bptVpBn ?? 0n, 18);

  const formattedModeVp = formatterUtils.formatNumber(modeVp, {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const formattedBptVp = formatterUtils.formatNumber(bptVp, {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const modePercentage = Number(modeVp) ? Number(formatUnits(usedModeVp ?? 0n, 18)) / Number(modeVp) : 0;
  const bptPercentage = Number(bptVp) ? Number(formatUnits(usedBptVp ?? 0n, 18)) / Number(bptVp) : 0;

  const formattedModePercentage = formatterUtils.formatNumber(modePercentage, {
    format: NumberFormat.PERCENTAGE_SHORT,
  });
  const formattedBptPercentage = formatterUtils.formatNumber(bptPercentage, {
    format: NumberFormat.PERCENTAGE_SHORT,
  });

  const voted = (usedModeVp ?? 0n) > 0n || (usedBptVp ?? 0n) > 0n;

  return (
    <div className="sticky -bottom-1 -mb-12 md:-bottom-2 md:-mx-8">
      <DataListItem>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:py-2">
          <div className="col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <p className="title text-sm text-neutral-900">Your total voting power</p>
              <Avatar alt="Gauge icon" size="sm" responsiveSize={{ md: "sm" }} src="/mode-token-icon.png" />
              <p className="text-md md:text-base">{formattedModeVp} Mode</p>
              {modePercentage > 0 && <p className="hidden sm:block">({formattedModePercentage} used)</p>}
              <Avatar alt="Gauge icon" size="sm" responsiveSize={{ md: "sm" }} src="/bpt-token-icon.png" />
              <p className="text-md md:text-base">{formattedBptVp} BPT</p>
              {bptPercentage > 0 && <p className="hidden sm:block">({formattedBptPercentage} used)</p>}
            </div>
          </div>
          <div className="col-span-3 flex flex-col justify-items-center gap-2 lg:flex-row lg:items-center lg:justify-end">
            {hasVp && active && (
              <div className="flex w-fit">
                {voted || !!selectedGauges.length ? (
                  <Tag label={`${selectedGauges.length} selected`} />
                ) : (
                  <Tag label="Select gauges" />
                )}
              </div>
            )}
            {active ? (
              <VotingDialog voted={voted} selectedGauges={selectedGauges} onRemove={(gauge) => onRemove(gauge)} />
            ) : (
              <div className="flex w-fit justify-self-center md:justify-start">
                <Tag label={`Voting closed, come back ${nextVoteIn}`} />
              </div>
            )}
          </div>
        </div>
      </DataListItem>
    </div>
  );
};
