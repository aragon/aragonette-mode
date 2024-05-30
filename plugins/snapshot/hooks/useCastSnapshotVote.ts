import { PUB_APP_NAME, SNAPSHOT_SPACE, SNAPSHOT_TEST_HUB } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { Web3Provider, type ExternalProvider } from "@ethersproject/providers";
import snapshot from "@snapshot-labs/snapshot.js";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useCastSnapshotVote = (proposal = "", onSuccess?: () => void) => {
  const { addAlert } = useAlerts();
  const { address, connector } = useAccount();

  const [error, setError] = useState<Error | null>(null);
  const [receipt, setReceipt] = useState<unknown>();
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", { type: "error", timeout: 4 * 1000 });
      } else {
        addAlert("Could not approve the proposal", { type: "error" });
      }
      return;
    }

    if (receipt && isConfirmed) {
      addAlert("Vote registered", {
        description: "The transaction has been validated",
        type: "success",
      });

      onSuccess?.();
    }
  }, [isConfirming, isConfirmed]);

  const castVote = async (choice: number) => {
    if (!proposal || !choice || !address) {
      setError(new Error('"Missing required parameters."'));
      return;
    }

    const snapshotClient = new snapshot.Client712(SNAPSHOT_TEST_HUB);
    const provider = new Web3Provider((await connector?.getProvider()) as ExternalProvider);

    try {
      setIsConfirming(true);
      setError(null);

      const receipt = await snapshotClient.vote(provider, address, {
        space: SNAPSHOT_SPACE,
        proposal,
        type: "single-choice",
        choice,
        app: PUB_APP_NAME,
      });

      setIsConfirmed(true);
      setReceipt(receipt);
      onSuccess?.();
    } catch (error) {
      setIsConfirmed(false);
      logger.error("Could not confirm the proposal", error);
      setError(error as Error);
    } finally {
      setIsConfirming(false);
    }
  };

  return { castVote, isConfirming, isConfirmed, error, receipt };
};
