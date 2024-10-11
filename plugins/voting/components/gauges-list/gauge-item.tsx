import { Avatar, Button, DataListItem, formatterUtils, IconType, NumberFormat } from "@aragon/ods";
import { type GaugeItem } from "./types";
import { Fragment, useEffect, useState } from "react";
import { shortenAddress } from "@/utils/address";
import { useGetVotes } from "../../hooks/useGetVotes";
import { useOwnedTokens } from "@/plugins/stake/hooks/useOwnedTokens";
import { useGetGaugeVotes } from "../../hooks/useGetGaugeVotes";
import { formatUnits } from "viem";
import { GaugeDetailsDialog } from "./gauge-details-dialog";
import { Token } from "../../types/tokens";

type GaugeItemProps = {
  props: GaugeItem;
  totalVotes: bigint;
  selected: boolean;
  onSelect: (selected: boolean) => void;
};

export const GaugeListItem: React.FC<GaugeItemProps> = ({ props, selected, totalVotes: totalVotesBn, onSelect }) => {
  const metadata = props.metadata;
  const [openDialog, setOpenDialog] = useState(false);

  const { ownedTokens: modeOwnedTokens } = useOwnedTokens(Token.MODE);
  const modeTokenIds = modeOwnedTokens ?? [];

  const { ownedTokens: bptOwnedTokens } = useOwnedTokens(Token.BPT);
  const bptTokenIds = bptOwnedTokens ?? [];

  const { data: userModeVotesData } = useGetVotes(Token.MODE, [...modeTokenIds], props.address);
  const { data: userBptVotesData } = useGetVotes(Token.BPT, [...bptTokenIds], props.address);
  const { data: modeGaugeVotesData } = useGetGaugeVotes(Token.MODE, props.address);
  const { data: bptGaugeVotesData } = useGetGaugeVotes(Token.BPT, props.address);

  const userModeVotesBn = userModeVotesData ?? 0n;
  const userBptVotesBn = userBptVotesData ?? 0n;
  const modeGaugeTotalVotesBn = modeGaugeVotesData ?? 0n;
  const bptGaugeTotalVotesBn = bptGaugeVotesData ?? 0n;

  const gaugeTotalVotesBn = modeGaugeTotalVotesBn + bptGaugeTotalVotesBn;

  const modeUserVotes = formatterUtils.formatNumber(formatUnits(userModeVotesBn, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const bptUserVotes = formatterUtils.formatNumber(formatUnits(userBptVotesBn, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const gaugeTotalVotes = formatterUtils.formatNumber(formatUnits(gaugeTotalVotesBn, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const percentage = (Number(formatUnits(gaugeTotalVotesBn, 18)) / Number(formatUnits(totalVotesBn, 18))) * 100;

  useEffect(() => {
    if (userModeVotesBn > 0 || userBptVotesBn > 0) {
      onSelect(true);
    }
  }, [userModeVotesBn, userBptVotesBn]);

  return (
    <>
      <Fragment>
        <div className="hidden md:block">
          <GaugeDetailsDialog
            selectedGauge={props}
            openDialog={openDialog}
            onClose={() => {
              setOpenDialog(false);
            }}
          />
          <DataListItem
            key={metadata?.name}
            className="flex items-center gap-x-4 border border-neutral-100 p-4"
            onClick={() => {
              setOpenDialog(true);
            }}
          >
            <div className="flex w-1/6 flex-auto items-center gap-x-3">
              <Avatar
                alt="Gauge icon"
                size="lg"
                src={metadata?.logo}
                fallback={
                  <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                    {metadata?.name.slice(0, 2).toUpperCase()}
                  </span>
                }
              />
              <div className="flex flex-col">
                <div>{metadata?.name}</div>
                <div>{shortenAddress(props.address)}</div>
              </div>
            </div>
            <div className="w-1/4 flex-auto">
              <div className="flex flex-col text-right">
                <div>{gaugeTotalVotes} votes</div>
                <div>{percentage}% of total</div>
              </div>
            </div>
            <div className="w-1/4 flex-auto">
              <div className="flex flex-col text-right">
                <div>{modeUserVotes} Mode</div>
                <div>{bptUserVotes} BPT</div>
              </div>
            </div>
            <div className="w-1/4 flex-auto">
              <div className="flex flex-row-reverse">
                <Button
                  size="sm"
                  variant={selected ? "primary" : "tertiary"}
                  iconLeft={selected ? IconType.CHECKMARK : undefined}
                  className="btn btn-primary w-1/2"
                  onClick={(ev: any) => {
                    ev.stopPropagation();
                    onSelect(!selected);
                  }}
                >
                  {selected ? "Selected" : "Select to vote"}
                </Button>
              </div>
            </div>
          </DataListItem>
        </div>
        <div className="md:hidden">
          <DataListItem key={metadata?.name} className="my-2 border border-neutral-100 px-4 py-2">
            <dl className="flex flex-col divide-y divide-neutral-100">
              <div className="flex justify-between py-2">
                <div className="flex items-center gap-x-4">
                  <Avatar
                    alt="Gauge icon"
                    size="lg"
                    src={metadata?.logo}
                    fallback={
                      <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                        {metadata?.name.slice(0, 2).toUpperCase()}
                      </span>
                    }
                  />
                  {metadata?.name}
                </div>
                <div>{gaugeTotalVotes}</div>
              </div>
            </dl>
          </DataListItem>
        </div>
      </Fragment>
    </>
  );
};
