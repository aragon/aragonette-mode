import React, { useEffect } from "react";
import { Button, DialogContent, DialogFooter, DialogHeader, DialogRoot, InputNumber, Tag } from "@aragon/ods";
import { useMintToken } from "../../hooks/useMintToken";
import { useSetTimestamp } from "../../hooks/useSetTimestamp";
import { Token } from "../../types/tokens";
import { useNow } from "../../hooks/useNow";

export function DevTools() {
  const [ts, setTs] = React.useState(0n);
  const [secs, setSecs] = React.useState(0);
  const [mins, setMins] = React.useState(0);
  const [hours, setHours] = React.useState(0);
  const [days, setDays] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { mintToken: mintMode } = useMintToken(Token.MODE);
  const { mintToken: mintBpt } = useMintToken(Token.BPT);
  const { setTimestamp } = useSetTimestamp(ts);
  const { now } = useNow();

  useEffect(() => {
    const amount = days * 60 * 60 * 24 + hours * 60 * 60 + mins * 60 + secs;
    const timestamp = Math.floor(now / 1000 + amount);
    setTs(BigInt(timestamp));
  }, [days, hours, mins, secs, now]);

  const reset = () => {
    setSecs(0);
    setMins(0);
    setHours(0);
    setDays(0);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      {process.env.NODE_ENV === "development" && (
        <>
          <Button
            className="fixed bottom-3 right-20 z-50 !rounded-full"
            onClick={() => {
              setOpen(true);
            }}
            variant="primary"
          >
            Dev tools
          </Button>
          <DialogRoot open={open} onOpenChange={() => {}} onInteractOutside={close}>
            <DialogHeader title="Dev Tools" />
            <DialogContent>
              <div className="grid grid-cols-2 gap-3 py-3">
                <Button onClick={() => mintMode(10n * 10n ** 24n)} variant="secondary" size="md">
                  Mint MODE
                </Button>
                <Button onClick={() => mintBpt(10n * 10n ** 24n)} variant="secondary" size="md">
                  Mint BPT
                </Button>
              </div>
              <InputNumber placeholder="0" value={days} label="days" onChange={(val) => setDays(Number(val))} />
              <InputNumber placeholder="0" value={hours} label="hours" onChange={(val) => setHours(Number(val))} />
              <InputNumber placeholder="0" value={mins} label="mins" onChange={(val) => setMins(Number(val))} />
              <InputNumber placeholder="0" value={secs} label="sec" onChange={(val) => setSecs(Number(val))} />
              <div className="grid grid-cols-1 gap-3 py-3">
                <Tag className="w-fit text-nowrap" label={`Now: ${new Date(Number(now)).toISOString()}`} />
                <Tag className="w-fit text-nowrap" label={`Set: ${new Date(Number(ts) * 1000).toISOString()}`} />
              </div>
            </DialogContent>
            <DialogFooter
              primaryAction={{
                label: "Set Timestamp",
                onClick: () => {
                  setTimestamp();
                  close();
                },
              }}
              secondaryAction={{
                label: "Cancel",
                onClick: close,
              }}
            />
          </DialogRoot>
        </>
      )}
    </>
  );
}
