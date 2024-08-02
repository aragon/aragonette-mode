import { councilMemberList } from "@/features/services/query-options";
import { isAddressEqual } from "@/utils/evm";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

const addresses: string[] = ["0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf"];

export const useCanCreateProposal = () => {
  const { address } = useAccount();

  const [gatingStatus, setGatingStatus] = useState<"disconnected" | "unauthorized" | "authorized">();

  const {
    data: councilMemberListData,
    isLoading: councilMembersLoading,
    isFetched: councilMembersFetched,
  } = useQuery({
    ...councilMemberList(),
  });

  useEffect(() => {
    const connectedAccountWhitelisted =
      councilMembersFetched && !!councilMemberListData?.find((member) => isAddressEqual(member.address, address));

    if (!address) {
      setGatingStatus("disconnected");
    } else if (connectedAccountWhitelisted) {
      setGatingStatus("authorized");
    } else if (!connectedAccountWhitelisted) {
      setGatingStatus("unauthorized");
    }
  }, [address, councilMemberListData, councilMembersFetched]);

  return {
    isDisconnected: gatingStatus === "disconnected",
    isAuthorized: gatingStatus === "authorized",
    isUnAuthorized: gatingStatus === "unauthorized",
    isAuthenticating: !gatingStatus || councilMembersLoading,
  };
};
