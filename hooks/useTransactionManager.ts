import { useEffect } from "react";
import { useAlerts } from "@/context/Alerts";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ContractFunctionExecutionError } from "viem";

export type TxLifecycleParams = {
  onSuccessMessage?: string;
  onSuccessDescription?: string;
  onSuccess?: () => void;
  onDeclineMessage?: string;
  onDeclineDescription?: string;
  onErrorMessage?: string;
  onErrorDescription?: string;
  onError?: (error: Error) => void;
};

type TransactionError = {
  type: "user-rejected" | "revert" | "network" | "unknown";
  message: string;
  functionName?: string;
  details?: string;
};

const parseTransactionError = (error: Error): TransactionError => {
  // User rejected transaction
  if (error.message?.includes("User rejected") || error.message?.includes("UserRejected")) {
    return {
      type: "user-rejected",
      message: "Transaction rejected by user",
    };
  }

  if (error instanceof ContractFunctionExecutionError) {
    const functionMatch = error.message.match(/function\s+"([^"]+)"/);
    const functionName = functionMatch ? functionMatch[1] : "unknown";

    const customErrorMatch = error.message.match(/Error:\s*([a-zA-Z0-9_]+)\(/);
    const customError = customErrorMatch ? customErrorMatch[1] : null;

    const revertMatch = error.message.match(/reverted with reason string\s+'([^']+)'/);
    const revertReason = revertMatch ? revertMatch[1] : null;

    const details = customError ? `Error: ${customError}` : revertReason ? revertReason : "Transaction reverted";

    return {
      type: "revert",
      message: `${functionName}() failed`,
      functionName,
      details,
    };
  }

  if (error.message?.includes("network") || error.message?.includes("timeout")) {
    return {
      type: "network",
      message: "Network error occurred",
      details: error.message,
    };
  }

  return {
    type: "unknown",
    message: "Transaction failed",
    details: error.message,
  };
};

export function useTransactionManager(params: TxLifecycleParams) {
  const { onSuccess, onError } = params;
  const { writeContract, data: hash, error, status } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    timeout: 60_000,
  });
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (status === "idle" || status === "pending") return;

    if (status === "error" && error) {
      const parsedError = parseTransactionError(error);

      switch (parsedError.type) {
        case "user-rejected":
          addAlert(params.onDeclineMessage ?? parsedError.message, {
            description: params.onDeclineDescription ?? "Transaction was not sent to the network",
            timeout: 4000,
            type: "error",
          });
          break;

        case "revert":
          addAlert(params.onErrorMessage ?? parsedError.message, {
            description: params.onErrorDescription ?? parsedError.details,
            timeout: 4000,
            type: "error",
          });
          break;

        case "network":
          addAlert(params.onErrorMessage ?? "Network Error", {
            description: params.onErrorDescription ?? parsedError.details,
            timeout: 4000,
            type: "error",
          });
          break;

        default:
          addAlert(params.onErrorMessage ?? parsedError.message, {
            description: params.onErrorDescription ?? parsedError.details,
            type: "error",
            timeout: 4000,
          });
      }

      if (typeof onError === "function") {
        onError(error);
      }
      return;
    }

    if (!hash) return;

    if (isConfirming) {
      addAlert("Transaction Pending", {
        description: "Waiting for network confirmation...",
        txHash: hash,
        type: "info",
      });
      return;
    }

    if (isConfirmed) {
      addAlert(params.onSuccessMessage ?? "Transaction Successful", {
        description: params.onSuccessDescription ?? "Transaction has been confirmed",
        txHash: hash,
        timeout: 6000,
        type: "success",
      });

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    }
  }, [
    status,
    hash,
    isConfirming,
    isConfirmed,
    error,
    onError,
    addAlert,
    params.onDeclineMessage,
    params.onDeclineDescription,
    params.onErrorMessage,
    params.onErrorDescription,
    params.onSuccessMessage,
    params.onSuccessDescription,
    onSuccess,
  ]);

  return {
    writeContract,
    hash,
    status,
    isConfirming,
    isConfirmed,
    error,
  };
}
