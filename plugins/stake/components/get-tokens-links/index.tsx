import React from "react";
import { PUB_GET_MORE_BPT_URL, PUB_GET_MORE_MODE_URL, PUB_GET_MORE_BOTH_URL } from "@/constants";
import { Button, IconType } from "@aragon/ods";
import { useMintToken } from "../../hooks/useMintToken";
import { Token } from "../../types/tokens";

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
      {process.env.NODE_ENV !== "development" && <DevMintTokens />}
    </div>
  );
};

function DevMintTokens() {
  const { mintToken: mintMode } = useMintToken(Token.MODE);
  const { mintToken: mintBpt } = useMintToken(Token.BPT);

  return (
    <>
      <Button onClick={() => mintMode(10n * 10n ** 24n)} variant="secondary" size="md">
        Mint MODE
      </Button>
      <Button onClick={() => mintBpt(10n * 10n ** 24n)} variant="secondary" size="md">
        Mint BPT
      </Button>
    </>
  );
}

export default GetMoreTokens;
