import { toHex } from "viem";
import { deploymentPublicClient as publicClient, deploymentWalletClient as walletClient } from "./lib/util/client";
import { deploymentAccount as account } from "./lib/util/account";
import { DaoAbi } from "../artifacts/DAO.sol";

async function main() {
  console.log("Executing");

  const { request } = await publicClient.simulateContract({
    address: "0xa119833aba78d4639c6ce6c2fe3ca4c7de02d710",
    abi: DaoAbi,
    functionName: "execute",
    args: [toHex(1), [], BigInt(0)],
    account,
  });
  const hash = await walletClient.writeContract(request);

  console.log("  - Waiting for transaction (" + hash + ")");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt) {
    throw new Error("The transaction failed");
  }

  console.log("Done");
}

main();
