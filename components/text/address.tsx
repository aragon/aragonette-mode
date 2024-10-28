import { formatHexString } from "@/utils/evm";
import { getChildrenText } from "@/utils/content";
import { type ReactNode, useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { PUB_CHAIN_BLOCK_EXPLORER } from "@/constants";
// import { Link } from '@aragon/ods'

export const AddressText = ({ children, bold }: { children: ReactNode; bold?: boolean }) => {
  const address = getChildrenText(children);
  const client = usePublicClient();
  const [link, setLink] = useState<string>();

  const useBold = bold === undefined ? true : bold;

  useEffect(() => {
    if (!client) return;

    setLink(`${PUB_CHAIN_BLOCK_EXPLORER}/address/${address}`);
  }, [address, client]);

  const formattedAddress = formatHexString(address.trim());
  if (!link) {
    return <span className={(useBold ? "font-semibold" : "") + " text-primary-400 underline"}>{formattedAddress}</span>;
  }
  return (
    <>
      <a href={link} target="_blank" className={(useBold ? "font-semibold" : "") + " text-primary-400 underline"}>
        {formattedAddress}
      </a>
    </>
  );
};
