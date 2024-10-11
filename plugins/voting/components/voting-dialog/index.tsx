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
import { formatUnits } from "viem";

type VotingDialogProps = {
  selectedGauges: GaugeItem[];
  modeOwnedTokens: bigint[];
  bptOwnedTokens: bigint[];
  onRemove: (gauge: GaugeItem) => void;
};

export const VotingDialog: React.FC<VotingDialogProps> = ({
  selectedGauges,
  modeOwnedTokens,
  bptOwnedTokens,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [modeVotes, setModeVotes] = useState(
    selectedGauges.map((gauge) => {
      return {
        gauge,
        votes: Math.floor(100 / selectedGauges.length),
      };
    })
  );
  const [bptVotes, setBptVotes] = useState(
    selectedGauges.map((gauge) => {
      return {
        gauge,
        votes: Math.floor(100 / selectedGauges.length),
      };
    })
  );

  const { vp: modeVp } = useGetAccountVp(Token.MODE);
  const { vp: bptVp } = useGetAccountVp(Token.BPT);

  const formattedModeVp = formatterUtils.formatNumber(formatUnits(modeVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const formattedBptVp = formatterUtils.formatNumber(formatUnits(bptVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const { vote: bptVote, isConfirming: bptIsConfirming } = useVote(
    Token.BPT,
    bptOwnedTokens,
    bptVotes.map((v) => ({ gauge: v.gauge.address, weight: BigInt(v.votes * 100) })),
    () => setOpen(false)
  );
  const { vote: modeVote, isConfirming: modeIsConfirming } = useVote(
    Token.MODE,
    modeOwnedTokens,
    modeVotes.map((v) => ({ gauge: v.gauge.address, weight: BigInt(v.votes * 100) })),
    bptVote
  );

  useEffect(() => {
    if (!selectedGauges.length) {
      setOpen(false);
    }
    setBptVotes(
      selectedGauges.map((gauge) => {
        return {
          gauge,
          votes: Math.floor(100 / selectedGauges.length),
        };
      })
    );
    setModeVotes(
      selectedGauges.map((gauge) => {
        return {
          gauge,
          votes: Math.floor(100 / selectedGauges.length),
        };
      })
    );
  }, [selectedGauges, selectedGauges.length]);

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
        variant="primary"
        disabled={!selectedGauges.length}
      >
        Vote now
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
                    modeVotes={modeVotes.find((v) => v.gauge === gauge)?.votes ?? 50}
                    bptVotes={bptVotes.find((v) => v.gauge === gauge)?.votes ?? 50}
                    onRemove={() => {
                      setModeVotes(modeVotes.filter((v) => v.gauge !== gauge));
                      setBptVotes(bptVotes.filter((v) => v.gauge !== gauge));
                      onRemove(gauge);
                    }}
                    onChange={(m, b) => {
                      if (m === Token.MODE) {
                        const newValue = { gauge, votes: b };
                        const oldModeVotes = modeVotes.filter((v) => v.gauge !== gauge);
                        oldModeVotes.sort((a, b) => {
                          //if (a.votes === b.votes) {
                          //  return a.g
                          //}
                          return b.votes - a.votes;
                        });
                        const sum = oldModeVotes.reduce((acc, v) => acc + v.votes, 0) + newValue.votes;
                        if (oldModeVotes.length) {
                          if (sum > 100) {
                            //Search for the last element with votes > 0 and decrease it
                            for (let i = oldModeVotes.length - 1; i >= 0; i--) {
                              if (oldModeVotes[i].votes > 0) {
                                oldModeVotes[i].votes -= sum - 100;
                                break;
                              }
                            }
                          } else if (sum < 100) {
                            //Search for the last element with votes < 100 and increase it
                            for (let i = oldModeVotes.length - 1; i >= 0; i--) {
                              if (oldModeVotes[i].votes <= 100) {
                                oldModeVotes[i].votes += 100 - sum;
                                break;
                              }
                            }
                          }
                        }
                        setModeVotes([...oldModeVotes, newValue]);
                      } else {
                        const newValue = { gauge, votes: b };
                        const oldBptVotes = bptVotes.filter((v) => v.gauge !== gauge);
                        oldBptVotes.sort((a, b) => {
                          //if (a.votes === b.votes) {
                          //  return a.g
                          //}
                          return b.votes - a.votes;
                        });
                        const sum = oldBptVotes.reduce((acc, v) => acc + v.votes, 0) + newValue.votes;
                        if (oldBptVotes.length) {
                          if (sum > 100) {
                            //Search for the last element with votes > 0 and decrease it
                            for (let i = oldBptVotes.length - 1; i >= 0; i--) {
                              if (oldBptVotes[i].votes > 0) {
                                oldBptVotes[i].votes -= sum - 100;
                                break;
                              }
                            }
                          } else if (sum < 100) {
                            //Search for the last element with votes < 100 and increase it
                            for (let i = oldBptVotes.length - 1; i >= 0; i--) {
                              if (oldBptVotes[i].votes <= 100) {
                                oldBptVotes[i].votes += 100 - sum;
                                break;
                              }
                            }
                          }
                        }
                        setBptVotes([...oldBptVotes, newValue]);
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
                  setBptVotes(
                    selectedGauges.map((gauge) => {
                      return {
                        gauge,
                        votes: Math.floor(100 / selectedGauges.length),
                      };
                    })
                  );
                  setModeVotes(
                    selectedGauges.map((gauge) => {
                      return {
                        gauge,
                        votes: Math.floor(100 / selectedGauges.length),
                      };
                    })
                  );
                }}
              >
                Distribute evently
              </Button>
              <Button size="sm" variant="tertiary">
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogFooter
          primaryAction={{
            isLoading: modeIsConfirming || bptIsConfirming,
            label: "Submit votes",
            onClick: () => {
              modeVote();
            },
          }}
          secondaryAction={{
            label: "Cancel",
            onClick: () => {
              setOpen(false);
            },
          }}
        />
      </DialogRoot>
    </>
  );
};
