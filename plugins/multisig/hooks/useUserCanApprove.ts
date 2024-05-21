import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_MULTISIG_ADDRESS } from "@/constants";
import { type Address } from "viem";
import { useAccount, useReadContract } from "wagmi";

export const useUserCanApprove = (proposalId = "") => {
  const { address } = useAccount();

  const { data: canVote, isFetched } = useReadContract({
    address: PUB_MULTISIG_ADDRESS,
    abi: MultisigAbi,
    functionName: "canApprove",
    args: [proposalId as any, address as Address],
    query: { enabled: !!address && !!proposalId },
  });

  return !!(canVote && isFetched);
};
