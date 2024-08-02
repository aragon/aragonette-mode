import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

const addresses: string[] = [];

export const useCanCreateProposal = () => {
  const { address } = useAccount();

  const [gatingStatus, setGatingStatus] = useState<"disconnected" | "unauthorized" | "authorized">();

  useEffect(() => {
    if (!address) {
      setGatingStatus("disconnected");
    } else if (addresses.includes(address.toLowerCase())) {
      setGatingStatus("authorized");
    } else {
      setGatingStatus("unauthorized");
    }
  }, [address]);

  return {
    isDisconnected: gatingStatus === "disconnected",
    isAuthorized: gatingStatus === "authorized",
    isUnAuthorized: gatingStatus === "unauthorized",
  };
};
