import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from "react";
import { type IAlert } from "@/utils/types";
import { usePublicClient } from "wagmi";
import { PUB_CHAIN_BLOCK_EXPLORER } from "@/constants";

const DEFAULT_ALERT_TIMEOUT = 7 * 1000;

export type AlertOptions = {
  type?: "success" | "info" | "error";
  description?: string;
  txHash?: string;
  timeout?: number;
};

export interface AlertContextProps {
  alerts: IAlert[];
  addAlert: (message: string, alertOptions?: AlertOptions) => void;
}

export const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const client = usePublicClient();
  const timeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timeouts = timeoutRefs.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const addAlert = useCallback(
    (message: string, alertOptions?: AlertOptions) => {
      setAlerts((curAlerts) => {
        const existingIdx = curAlerts.findIndex((a) => {
          if (a.message !== message) return false;
          else if (a.description !== alertOptions?.description) return false;
          else if (a.type !== alertOptions?.type) return false;
          return true;
        });

        if (existingIdx >= 0) {
          const updatedAlerts = [...curAlerts];
          const existingAlert = updatedAlerts[existingIdx];

          const existingTimeout = timeoutRefs.current.get(existingAlert.id);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
            timeoutRefs.current.delete(existingAlert.id);
          }

          const timeout = alertOptions?.timeout ?? DEFAULT_ALERT_TIMEOUT;
          const newTimeout = setTimeout(() => removeAlert(existingAlert.id), timeout);
          timeoutRefs.current.set(existingAlert.id, newTimeout);

          updatedAlerts.splice(existingIdx, 1);
          updatedAlerts.push(existingAlert);

          return updatedAlerts;
        }

        const newAlert: IAlert = {
          id: Date.now(),
          message,
          description: alertOptions?.description,
          type: alertOptions?.type ?? "info",
        };
        if (alertOptions?.txHash && client) {
          newAlert.explorerLink = `${PUB_CHAIN_BLOCK_EXPLORER}/tx/${alertOptions.txHash}`;
        }

        const timeout = alertOptions?.timeout ?? DEFAULT_ALERT_TIMEOUT;
        const newTimeout = setTimeout(() => removeAlert(newAlert.id), timeout);
        timeoutRefs.current.set(newAlert.id, newTimeout);

        return [...curAlerts, newAlert];
      });
    },
    [client, removeAlert]
  );

  const contextValue = React.useMemo(
    () => ({
      alerts,
      addAlert,
    }),
    [alerts, addAlert]
  );

  return <AlertContext.Provider value={contextValue}>{children}</AlertContext.Provider>;
};

export const useAlerts = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlerts must be used inside the AlertProvider");
  }

  return context;
};
