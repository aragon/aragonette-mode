import { Avatar, DataListItem, formatterUtils, NumberFormat, Tag } from "@aragon/ods";

import { VotingDialog } from "../voting-dialog";
import { type GaugeItem } from "../gauges-list/types";
import { Token } from "../../types/tokens";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";
import { formatUnits } from "viem";
import { useGetUsedVp } from "../../hooks/useGetUsedVp";
import { useAccount } from "wagmi";

type VotingBarProps = {
  selectedGauges: GaugeItem[];
  onRemove: (gauge: GaugeItem) => void;
};

export const VotingBar: React.FC<VotingBarProps> = ({ selectedGauges, onRemove }) => {
  const { isConnected } = useAccount();

  const { ownedTokens: modeOwnedTokensData } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptOwnedTokensData } = useOwnedTokens(Token.BPT);

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
    <div className="sticky -bottom-2 -mb-12 md:-mx-12">
      <DataListItem>
        <div className="flex flex-col gap-4 py-2 md:flex-row md:items-center">
          <p className="text-xl md:text-base">Your total voting power</p>
          <div className="flex flex-grow flex-row gap-8">
            <div className="flex flex-row items-center gap-2">
              <Avatar alt="Gauge icon" size="md" responsiveSize={{ md: "sm" }} src="/mode-token-icon.png" />
              <p className="text-xl md:text-base">{formattedModeVp} Mode</p>
              <p className="hidden sm:block">({formattedModePercentage} used)</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Avatar alt="Gauge icon" size="md" responsiveSize={{ md: "sm" }} src="/bpt-token-icon.png" />
              <p className="text-xl md:text-base">{formattedBptVp} BPT</p>
              {bptPercentage > 0 && <p>({formattedBptPercentage} used)</p>}
            </div>
          </div>

          <div className="absolute right-3 top-4 md:relative md:right-0 md:top-0 md:flex md:flex-row md:gap-2">
            {hasVp &&
              (voted || !!selectedGauges.length ? (
                <Tag label={`${selectedGauges.length} selected`} />
              ) : (
                <Tag label="Select gauges" />
              ))}
          </div>
          <VotingDialog voted={voted} selectedGauges={selectedGauges} onRemove={(gauge) => onRemove(gauge)} />
        </div>
      </DataListItem>
    </div>
  );
};
