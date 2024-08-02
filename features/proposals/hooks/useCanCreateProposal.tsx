import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

const addresses: string[] = ["0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf"];

export const useCanCreateProposal = () => {
  const { address } = useAccount();

  const [gatingStatus, setGatingStatus] = useState<"disconnected" | "unauthorized" | "authorized">();

  useEffect(() => {
    if (!address) {
      setGatingStatus("disconnected");
    } else if (addresses.includes(address)) {
      setGatingStatus("authorized");
    } else {
      setGatingStatus("unauthorized");
    }
  }, [address]);

  return {
    isDisconnected: gatingStatus === "disconnected",
    isAuthorized: gatingStatus === "authorized",
    isUnAuthorized: gatingStatus === "unauthorized",
    isAuthenticating: false,
  };
};
