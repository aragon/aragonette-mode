import { type ReactNode } from "react";
import { type Address } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { MissingContentView } from "@/components/MissingContentView";

export type PlaceHolderOr = {
  selfAddress: Address | undefined;
  isConnected: boolean;
  canCreate: boolean | undefined;
  children: ReactNode;
};

const PlaceHolderOr: React.FC<PlaceHolderOr> = ({ selfAddress, isConnected, canCreate, children }) => {
  const { open } = useWeb3Modal();

  if (!selfAddress || !isConnected) {
    return (
      <MissingContentView callToAction="Connect wallet" onClick={open}>
        Please connect your wallet to continue.
      </MissingContentView>
    );
  }

  if (!canCreate) {
    return (
      <MissingContentView>
        You cannot create proposals on the multisig because you are not currently defined as a member.
      </MissingContentView>
    );
  }

  return <>{children}</>;
};

export default PlaceHolderOr;
