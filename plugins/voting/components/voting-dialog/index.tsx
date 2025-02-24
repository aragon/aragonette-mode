import {
  AlertInline,
  Avatar,
  Button,
  DataListContainer,
  DataListRoot,
  DialogContent,
  DialogHeader,
  DialogRoot,
  formatterUtils,
  IconType,
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
  buttonLabel: string;
  onRemove: (gauge: GaugeItem) => void;
  disabled?: boolean;
};

type Vote = {
  address: Address;
  votes: number;
};

export const VotingDialog: React.FC<VotingDialogProps> = ({ selectedGauges, buttonLabel, onRemove, disabled }) => {
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
    bptVotes.map((v) => ({ gauge: v.address, weight: BigInt(Math.floor(v.votes * 100)) })),
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
    modeVotes.map((v) => ({ gauge: v.address, weight: BigInt(Math.floor(v.votes * 100)) })),
    bptVote
  );

  const tolerance = 1e-9;

  const totalModeVotes = modeVotes.reduce((acc, v) => acc + v.votes, 0);
  const totalBptVotes = bptVotes.reduce((acc, v) => acc + v.votes, 0);
  const isValidVotes =
    (Math.abs(totalModeVotes - 100) < tolerance || totalModeVotes === 0) &&
    (totalBptVotes === 0 || Math.abs(totalBptVotes - 100) < tolerance) &&
    (Math.abs(totalModeVotes - 100) < tolerance || Math.abs(totalBptVotes - 100) < tolerance);

  useEffect(() => {
    if (!selectedGauges.length) {
      setOpen(false);
    }
  }, [selectedGauges.length]);

  const distributeEvenly = () => {
    const votes = selectedGauges.map((gauge, index) => {
      return {
        address: gauge.address,
        votes: (Math.floor(10000 / selectedGauges.length) + (index === 0 ? 10000 % selectedGauges.length : 0)) / 100,
      };
    });
    if (modeVp) setModeVotes(votes);
    if (bptVp) setBptVotes(votes);
  };

  const resetValues = () => {
    setModeVotes([]);
    setBptVotes([]);
  };

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
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
      <DialogRoot open={open} onInteractOutside={() => setOpen(false)} containerClassName="!max-w-[1200px]">
        <DialogHeader
          title="Distribute your votes"
          onCloseClick={() => setOpen(false)}
          onBackClick={() => setOpen(false)}
        />
        <DialogContent className="mt-3 flex flex-col gap-y-4 md:gap-y-6">
          <div className="mb-4 flex w-full flex-row items-center gap-4 md:hidden">
            <Button
              className="flex w-1/2"
              size="md"
              responsiveSize={{ md: "sm" }}
              variant="secondary"
              onClick={distributeEvenly}
            >
              Distribute evenly
            </Button>
            <Button
              className="flex w-1/2"
              size="md"
              responsiveSize={{ md: "sm" }}
              variant="tertiary"
              onClick={resetValues}
            >
              Reset
            </Button>
          </div>
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
                  tolerance={tolerance}
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
        </DialogContent>
        <div>
          <div className="flex flex-col gap-x-8 gap-y-2 px-8 py-4 md:flex-row md:items-center">
            <p className="title flex text-sm text-neutral-900">Your total votes</p>
            <div className="flex flex-row gap-2 md:flex-row md:gap-8">
              <div className="flex flex-row items-center gap-2 md:justify-center">
                <Avatar alt="Gauge icon" size="sm" responsiveSize={{ md: "sm" }} src="/mode-token-icon.png" />
                <p>{formattedModeVp} Mode</p>
              </div>
              <div className="flex flex-row items-center gap-2 md:justify-center">
                <Avatar alt="Gauge icon" size="sm" responsiveSize={{ md: "sm" }} src="/bpt-token-icon.png" />
                <p>{formattedBptVp} BPT</p>
              </div>
            </div>

            <div className="hidden grow flex-row justify-end gap-4 md:flex">
              <Button size="md" responsiveSize={{ md: "sm" }} variant="secondary" onClick={distributeEvenly}>
                Distribute evenly
              </Button>
              <Button size="md" responsiveSize={{ md: "sm" }} variant="tertiary" onClick={resetValues}>
                Reset
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col-reverse gap-4 px-6 pb-6 md:flex-row">
            <div className="flex flex-row gap-4">
              <Button
                className="flex-grow"
                size="md"
                iconLeft={IconType.APP_PROPOSALS}
                isLoading={modeIsConfirming || bptIsConfirming}
                disabled={!isValidVotes}
                onClick={() => {
                  modeVote();
                }}
              >
                Submit votes
              </Button>
              <Button
                className="hidden md:block"
                size="md"
                variant="tertiary"
                onClick={() => {
                  resetValues();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
            {!isValidVotes && (
              <AlertInline
                className="ml-2 justify-center"
                variant="critical"
                message="Percentages must add up to 100%"
              />
            )}
          </div>
        </div>
      </DialogRoot>
    </>
  );
};
