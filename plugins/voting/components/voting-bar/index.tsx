import { Avatar, DataListItem, formatterUtils, NumberFormat, Tag } from "@aragon/ods";

import { VotingDialog } from "../voting-dialog";
import { type GaugeItem } from "../gauges-list/types";
import { Token } from "../../types/tokens";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";
import { formatUnits } from "viem";

type VotingBarProps = {
  selectedGauges: GaugeItem[];
  onRemove: (gauge: GaugeItem) => void;
};

export const VotingBar: React.FC<VotingBarProps> = ({ selectedGauges, onRemove }) => {
  const { ownedTokens: modeOwnedTokensData } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptOwnedTokensData } = useOwnedTokens(Token.BPT);

  const modeOwnedTokens = [...(modeOwnedTokensData ?? [])];
  const bptOwnedTokens = [...(bptOwnedTokensData ?? [])];

  const { vp: modeVp } = useGetAccountVp(Token.MODE);
  const { vp: bptVp } = useGetAccountVp(Token.BPT);

  const formattedModeVp = formatterUtils.formatNumber(formatUnits(modeVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const formattedBptVp = formatterUtils.formatNumber(formatUnits(bptVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  return (
    <div className="sticky -bottom-2 -mx-12 -mb-12">
      <DataListItem>
        <div className="flex flex-auto items-center gap-4 py-2">
          <p>Your total votes</p>
          <div className="flex flex-row gap-2">
            <Avatar alt="Gauge icon" size="sm" src="/mode-token-icon.png" />
            <p>{formattedModeVp} Mode</p>
          </div>
          <div className="flex flex-auto gap-2">
            <Avatar alt="Gauge icon" size="sm" src="/bpt-token-icon.png" />
            <p>{formattedBptVp} BPT</p>
          </div>
          <Tag label={`${selectedGauges.length} selected`} />
          <VotingDialog
            selectedGauges={selectedGauges}
            modeOwnedTokens={modeOwnedTokens}
            bptOwnedTokens={bptOwnedTokens}
            onRemove={(gauge) => onRemove(gauge)}
          />
        </div>
      </DataListItem>
    </div>
  );
};
