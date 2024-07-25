import { SnapshotDelegationAbi } from "@/artifacts/SnapshotDelegation.sol";
import { PUB_SNAPSHOT_DELEGATION_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import { stringToBytes, toHex, zeroAddress, type Address } from "viem";
import { useReadContracts } from "wagmi";

export const useDelegate = (address: Address | undefined, options = {}) => {
  const spaceId = toHex(stringToBytes(SNAPSHOT_SPACE, { size: 32 }));
  const globalId = toHex(stringToBytes("", { size: 32 }));

  return useReadContracts({
    allowFailure: false,
    query: {
      enabled: !!address,
      select: (data) => {
        if (data[0] !== zeroAddress) {
          return data[0];
        } else {
          return data[1];
        }
      },
      ...options,
    },
    contracts: [
      {
        address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
        abi: SnapshotDelegationAbi,
        functionName: "delegation",
        args: [address!, spaceId],
      },
      {
        address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
        abi: SnapshotDelegationAbi,
        functionName: "delegation",
        args: [address!, globalId],
      },
    ],
  });
};
