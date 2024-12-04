import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { type ReactNode, useEffect } from "react";
import ProposalCard from "@/plugins/multisig/components/proposal";
import { MultisigPluginAbi } from "@/plugins/multisig/artifacts/MultisigPlugin.sol";
import { Button, DataList, IconType, ProposalDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { useCanCreateProposal } from "@/plugins/multisig/hooks/useCanCreateProposal";
import Link from "next/link";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PUB_MULTISIG_PLUGIN_ADDRESS, PUB_CHAIN } from "@/constants";
import { MainSection } from "@/components/layout/main-section";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { MissingContentView } from "@/components/MissingContentView";

const DEFAULT_PAGE_SIZE = 6;

export default function Proposals() {
  const { isConnected } = useAccount();
  const { canCreate } = useCanCreateProposal();
  const { open } = useWeb3Modal();

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const {
    data: proposalCountResponse,
    error: isError,
    isLoading,
    isFetching: isFetchingNextPage,
    refetch,
  } = useReadContract({
    address: PUB_MULTISIG_PLUGIN_ADDRESS,
    abi: MultisigPluginAbi,
    functionName: "proposalCount",
    chainId: PUB_CHAIN.id,
  });
  const proposalCount = Number(proposalCountResponse);

  useEffect(() => {
    refetch();
  }, [blockNumber]);

  const entityLabel = proposalCount === 1 ? "Proposal" : "Proposals";

  let dataListState: DataListState = "idle";
  if (isLoading && !proposalCount) {
    dataListState = "initialLoading";
  } else if (isError) {
    dataListState = "error";
  } else if (isFetchingNextPage) {
    dataListState = "fetchingNextPage";
  }

  return (
    <div className="flex w-full flex-col items-end justify-end gap-y-6">
      <div className="flex w-full flex-col justify-end gap-2 justify-self-end md:flex-row">
        <If true={isConnected && canCreate}>
          <Link href="#/new">
            <Button iconLeft={IconType.PLUS} size="sm" variant="primary">
              Create Proposal
            </Button>
          </Link>
        </If>
      </div>

      <If not={isConnected}>
        <Then>
          <MissingContentView callToAction="Connect wallet" onClick={() => open()}>
            Please connect your wallet to access the proposals section.
          </MissingContentView>
        </Then>
        <ElseIf not={proposalCount}>
          <MissingContentView>
            No proposals have been created yet. <br />
            Here you will see the proposals created by the Council before they can be submitted to the community veto
            stage. <If true={canCreate}>Create your first proposal.</If>
          </MissingContentView>
        </ElseIf>
        <Else>
          <DataList.Root
            entityLabel={entityLabel}
            itemsCount={proposalCount}
            pageSize={DEFAULT_PAGE_SIZE}
            state={dataListState}
            //onLoadMore={fetchNextPage}
          >
            <DataList.Container SkeletonElement={ProposalDataListItemSkeleton} className="w-full">
              {proposalCount &&
                Array.from(Array(proposalCount || 0)?.keys())
                  .reverse()
                  ?.map((proposalIndex) => (
                    // TODO: update with router agnostic ODS DataListItem
                    <ProposalCard key={proposalIndex} proposalId={BigInt(proposalIndex)} />
                  ))}
            </DataList.Container>
            <DataList.Pagination />
          </DataList.Root>
        </Else>
      </If>
    </div>
  );
}
