import React from "react";
import { PUB_GET_MORE_BPT_URL, PUB_GET_MORE_MODE_URL, PUB_GET_MORE_BOTH_URL } from "@/constants";
import { Button, IconType, InputNumber, Tag } from "@aragon/ods";
import { useMintToken } from "../../hooks/useMintToken";
import { useSetTimestamp } from "../../hooks/useSetTimestamp";
import { Token } from "../../types/tokens";
import { useNow } from "../../hooks/useNow";

const GetMoreTokens = () => {
  return (
    <div className="grid grid-cols-3 gap-3 py-3">
      <Button
        href={PUB_GET_MORE_MODE_URL}
        target="_blank"
        variant="secondary"
        size="md"
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get MODE
      </Button>
      <Button
        href={PUB_GET_MORE_BPT_URL}
        target="_blank"
        variant="secondary"
        size="md"
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get BPT
      </Button>
      <Button
        href={PUB_GET_MORE_BOTH_URL}
        target="_blank"
        variant="secondary"
        size="md"
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get Both
      </Button>

      {/* TODO: Remove when ready to ship */}
      {process.env.NODE_ENV === "development" && <DevMintTokens />}
    </div>
  );
};

function DevMintTokens() {
  const [ts, setTs] = React.useState(0n);
  const [sec, setSec] = React.useState(0);
  const [hours, setHours] = React.useState(0);
  const [days, setDays] = React.useState(0);

  const { mintToken: mintMode } = useMintToken(Token.MODE);
  const { mintToken: mintBpt } = useMintToken(Token.BPT);
  const { setTimestamp } = useSetTimestamp(ts);
  const { now } = useNow();

  const computeTimestamp = (amount: number) => {
    const timestamp = Math.floor(now / 1000 + amount);
    setTs(BigInt(timestamp));
  };

  return (
    <>
      <Button onClick={() => mintMode(10n * 10n ** 24n)} variant="secondary" size="md">
        Mint MODE
      </Button>
      <Button onClick={() => mintBpt(10n * 10n ** 24n)} variant="secondary" size="md">
        Mint BPT
      </Button>
      <span></span>
      <InputNumber placeholder="0" label="days" onChange={(val) => computeTimestamp(Number(val) * 60 * 60 * 24)} />
      <InputNumber placeholder="0" label="hours" onChange={(val) => computeTimestamp(Number(val) * 60 * 60)} />
      <InputNumber placeholder="0" label="sec" onChange={(val) => computeTimestamp(Number(val))} />
      <Tag className="w-fit text-nowrap" label={"Set: " + new Date(Number(ts) * 1000).toISOString()} />
      <span></span>
      <Button onClick={() => setTimestamp()} variant="secondary" size="md">
        Set
      </Button>
      <Tag className="w-fit text-nowrap" label={"Now: " + new Date(Number(now)).toISOString()} />
      <span></span>
      <Button
        onClick={() => {
          setTs(BigInt(Math.floor(new Date().getTime() / 1000)));
          setTimestamp();
        }}
        variant="secondary"
        size="md"
      >
        Reset
      </Button>
    </>
  );
}

export default GetMoreTokens;
