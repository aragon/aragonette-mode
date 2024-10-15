import {
  Avatar,
  Button,
  DataListContainer,
  DataListRoot,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  formatterUtils,
  NumberFormat,
} from "@aragon/ods";
import { useEffect, useState } from "react";
import { VotingListItem } from "./voting-item";
import { type GaugeItem } from "../gauges-list/types";
import { Token } from "../../types/tokens";
import { useVote } from "../../hooks/useVote";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";
import { type Address, formatUnits } from "viem";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { useGetVps } from "../../hooks/useGetVps";
import { useQueryClient } from "@tanstack/react-query";

type VotingDialogProps = {
  selectedGauges: GaugeItem[];
  voted: boolean;
  onRemove: (gauge: GaugeItem) => void;
};

type Vote = {
  address: Address;
  votes: number;
};

export const VotingDialog: React.FC<VotingDialogProps> = ({ selectedGauges, voted, onRemove }) => {
  const [open, setOpen] = useState(false);
  const [modeVotes, setModeVotes] = useState<Vote[]>([]);
  const [bptVotes, setBptVotes] = useState<Vote[]>([]);

  const { ownedTokens: modeOwnedTokensData } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptOwnedTokensData } = useOwnedTokens(Token.BPT);

  const modeOwnedTokens = [...(modeOwnedTokensData ?? [])];
  const bptOwnedTokens = [...(bptOwnedTokensData ?? [])];

  const { data: modeOwnedTokensWithVp } = useGetVps(Token.MODE, modeOwnedTokens);
  const { data: bptOwnedTokensWithVp } = useGetVps(Token.BPT, bptOwnedTokens);

  const { vp: modeVp } = useGetAccountVp(Token.MODE);
  const { vp: bptVp } = useGetAccountVp(Token.BPT);

  const formattedModeVp = formatterUtils.formatNumber(formatUnits(modeVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const formattedBptVp = formatterUtils.formatNumber(formatUnits(bptVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const queryClient = useQueryClient();

  const { vote: bptVote, isConfirming: bptIsConfirming } = useVote(
    Token.BPT,
    bptOwnedTokensWithVp ?? [],
    bptVotes.map((v) => ({ gauge: v.address, weight: BigInt(v.votes * 100) })),
    async () => {
      await queryClient.invalidateQueries({ queryKey: ["readContracts", { functionName: "gaugeVotes" }] });
      await queryClient.invalidateQueries({ queryKey: ["readContracts", { functionName: "usedVotingPower" }] });
      // TODO: Remove this when we have a better way to invalidate the cache
      await queryClient.invalidateQueries();
      setOpen(false);
    }
  );
  const { vote: modeVote, isConfirming: modeIsConfirming } = useVote(
    Token.MODE,
    modeOwnedTokensWithVp ?? [],
    modeVotes.map((v) => ({ gauge: v.address, weight: BigInt(v.votes * 100) })),
    bptVote
  );

  const totalModeVotes = modeVotes.reduce((acc, v) => acc + v.votes, 0);
  const totalBptVotes = bptVotes.reduce((acc, v) => acc + v.votes, 0);
  const isValidVotes =
    (totalModeVotes === 100 || totalModeVotes === 0) && (totalBptVotes === 0 || totalBptVotes === 100);

  useEffect(() => {
    if (!selectedGauges.length) {
      setOpen(false);
    }
  }, [selectedGauges.length]);

  return (
    <>
      <Button
        size="lg"
        responsiveSize={{ md: "sm" }}
        isLoading={open}
        onClick={() => {
          setOpen(true);
        }}
        variant="primary"
        disabled={!selectedGauges.length}
      >
        {!voted ? "Vote now" : "Edit votes"}
      </Button>
      <DialogRoot open={open} onInteractOutside={() => setOpen(false)} containerClassName="!max-w-[1200px]">
        <DialogHeader
          title="Distribute your votes"
          onCloseClick={() => setOpen(false)}
          onBackClick={() => setOpen(false)}
        />
        <DialogContent className="flex flex-col gap-y-4 md:gap-y-6">
          <div className="mt-8">
            <DataListRoot entityLabel="Projects" pageSize={selectedGauges.length} className="gap-y-6">
              <DataListContainer>
                {selectedGauges.map((gauge, pos) => (
                  <VotingListItem
                    key={pos}
                    gauge={gauge}
                    modeVotes={modeVotes.find((v) => v.address === gauge.address)?.votes}
                    bptVotes={bptVotes.find((v) => v.address === gauge.address)?.votes}
                    totalModeVotes={modeVotes.reduce((acc, v) => acc + v.votes, 0)}
                    totalBptVotes={bptVotes.reduce((acc, v) => acc + v.votes, 0)}
                    onRemove={() => {
                      setModeVotes(modeVotes.filter((v) => v.address !== gauge.address));
                      setBptVotes(bptVotes.filter((v) => v.address !== gauge.address));
                      onRemove(gauge);
                    }}
                    onChange={(token, val) => {
                      const newValue = {
                        address: gauge.address,
                        votes: val,
                      };

                      if (token === Token.MODE) {
                        setModeVotes((votes) => {
                          const oldVotes = votes.filter((v) => v.address !== gauge.address);
                          oldVotes.push(newValue);
                          return oldVotes;
                        });
                      } else {
                        setBptVotes((votes) => {
                          const oldVotes = votes.filter((v) => v.address !== gauge.address);
                          oldVotes.push(newValue);
                          return oldVotes;
                        });
                      }
                    }}
                  />
                ))}
              </DataListContainer>
            </DataListRoot>
          </div>
          <div className="flex flex-auto items-center gap-4 pb-2">
            <div className="flex w-1/2 flex-auto gap-2">
              <p>Your total votes</p>
              <div className="flex flex-row gap-2">
                <Avatar alt="Gauge icon" size="sm" src="/mode-token-icon.png" />
                <p>{formattedModeVp} Mode</p>
              </div>
              <div className="flex flex-auto gap-2">
                <Avatar alt="Gauge icon" size="sm" src="/bpt-token-icon.png" />
                <p>{formattedBptVp} BPT</p>
              </div>
            </div>
            <div className="flex flex-row-reverse items-center gap-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const votes = selectedGauges.map((gauge, index) => {
                    return {
                      address: gauge.address,
                      votes: Math.floor(100 / selectedGauges.length) + (index === 0 ? 100 % selectedGauges.length : 0),
                    };
                  });
                  if (modeVp) setModeVotes(votes);
                  if (bptVp) setBptVotes(votes);
                }}
              >
                Distribute evently
              </Button>
              <Button
                size="sm"
                variant="tertiary"
                onClick={() => {
                  setModeVotes([]);
                  setBptVotes([]);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogFooter
          primaryAction={{
            isLoading: modeIsConfirming || bptIsConfirming,
            disabled: !isValidVotes,
            label: "Submit votes",
            onClick: () => {
              modeVote();
            },
          }}
          secondaryAction={{
            label: "Cancel",
            onClick: () => {
              setModeVotes([]);
              setBptVotes([]);
              setOpen(false);
            },
          }}
        />
      </DialogRoot>
    </>
  );
};
