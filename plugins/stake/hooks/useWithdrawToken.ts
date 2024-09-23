import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useWithdraw(token: Token, tokenId: bigint) {
  const { writeContract } = useTransactionManager({
    onSuccessMessage: "Withdrawal successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Withdrawal declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not withdraw",
    onErrorDescription: "The transaction could not be completed",
  });
  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);

  const withdraw = () => {
    forceChain({
      onSuccess: () =>
        writeContract({
          abi: VotingEscrow,
          address: escrowContract,
          functionName: "withdraw",
          args: [tokenId],
        }),
    });
  };

  return {
    withdraw,
  };
}
