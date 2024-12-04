import {
  Button,
  DataListContainer,
  DataListFilter,
  DataListRoot,
  type DataListState,
  IconType,
  Link,
} from "@aragon/ods";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetGauges } from "@/plugins/voting/hooks/useGetGauges";
import { type Address } from "viem";
import { Token } from "@/plugins/stake/types/tokens";
import { GaugeMetadata, type GaugeItem } from "@/plugins/voting/components/gauges-list/types";
import { useGetGaugeMetadata } from "@/plugins/voting/hooks/useGetGaugeMetadata";
import { useGetGaugesInfo } from "@/plugins/voting/hooks/useGetGaugesInfo";
import { useGetGaugeVotesMulti } from "@/plugins/voting/hooks/useGetGaugeVotesMulti";
import { useGetTotalGaugeVotes } from "@/plugins/voting/hooks/useGetTotalGaugeVotes";
import { GaugeListItem } from "./gauge";
import { Else, ElseIf, If, Then } from "@/components/if";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { MissingContentView } from "@/components/MissingContentView";

export const GaugesList: React.FC = () => {
  const { isConnected } = useAccount();
  const { canCreate } = useCanCreateProposal();
  const [searchValue, setSearchValue] = useState("");
  const [selectedGauges, setSelectedGauges] = useState<GaugeItem[]>([]);
  const [activeSort, setActiveSort] = useState<string>();
  const [listState, setListState] = useState<DataListState>();

  const sortItems = useMemo(() => [{ value: "votes_desc", label: "Total votes", type: "DESC" as const }], []);

  const pickActiveSort = useCallback(
    (sort: string) => {
      if (sort === activeSort) {
        setActiveSort(undefined);
      } else {
        setActiveSort(sort);
      }
    },
    [activeSort]
  );

  const emptyState = {
    primaryButton: {
      label: "Reset search",
      iconLeft: IconType.RELOAD,
      onClick: () => setSearchValue(""),
    },
    heading: "No projects found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
  };

  const { gauges: modeGauges } = useGetGauges(Token.MODE);
  const { gauges: bptGauges } = useGetGauges(Token.BPT);

  const noGauges = modeGauges?.length !== 0 || bptGauges?.length !== 0;

  const { data: modeInfo } = useGetGaugesInfo(Token.MODE, (modeGauges as Address[]) ?? []);
  const { data: bptInfo } = useGetGaugesInfo(Token.BPT, (bptGauges as Address[]) ?? []);

  const gaugesData = [...(modeInfo ?? []), ...(bptInfo ?? [])];

  const gaugesInfo = (gaugesData ?? []).filter((gauge) => gauge.info?.active);

  const { metadata: gaugesMetadata } = useGetGaugeMetadata<GaugeMetadata>(gaugesInfo.map((g) => g.info?.metadataURI));

  const allGauges: GaugeItem[] = gaugesInfo.map((gauge) => {
    const metadata = gaugesMetadata.find((m) => m.data?.ipfsUri === gauge.info?.metadataURI);
    return {
      ...gauge,
      metadata: metadata?.data?.metadata,
    };
  });

  const { data: totalModeVotesData } = useGetTotalGaugeVotes(
    Token.MODE,
    allGauges.filter((gauge) => gauge.token === Token.MODE).map((gauge) => gauge.address)
  );
  const { data: totalBptVotesData } = useGetTotalGaugeVotes(
    Token.BPT,
    allGauges.filter((gauge) => gauge.token === Token.BPT).map((gauge) => gauge.address)
  );

  const totalVotesBn = (totalModeVotesData ?? 0n) + (totalBptVotesData ?? 0n);

  const gauges = allGauges.filter((gauge, index, self) => {
    return index === self.findIndex((t) => t.address === gauge.address);
  });

  const filteredGauges = gauges.filter((gauge) => {
    if (!searchValue) return true;
    return (
      gauge.metadata?.name.toLowerCase().includes(searchValue.toLowerCase()) ??
      gauge.address.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const { data: modeGaugeVotesData } = useGetGaugeVotesMulti(
    Token.MODE,
    filteredGauges.filter((gauge) => gauge.token === Token.MODE).map((gauge) => gauge.address)
  );
  const { data: bptGaugeVotesData } = useGetGaugeVotesMulti(
    Token.BPT,
    allGauges.filter((gauge) => gauge.token === Token.BPT).map((gauge) => gauge.address)
  );

  const gaugesWithBPTAndMode = filteredGauges
    .map((gauge) => {
      const BPTVotes = bptGaugeVotesData?.find((v) => v?.address === gauge.address)?.amount ?? 0n;
      const modeVotes = modeGaugeVotesData?.find((v) => v?.address === gauge.address)?.amount ?? 0n;
      const totalVotes = BigInt(BPTVotes + modeVotes);

      return {
        ...gauge,
        BPTVotes,
        modeVotes,
        totalVotes,
      };
    })
    .sort((a, b) => {
      if (activeSort === "votes_desc") return a.totalVotes > b.totalVotes ? -1 : 1;
      return 0;
    });

  useEffect(() => {
    const isFiltered = searchValue != null && searchValue.trim().length > 0;
    if (isFiltered) {
      setListState("filtered");
    } else {
      setListState("idle");
    }
  }, [searchValue]);

  return (
    <div className="flex w-full flex-col items-end justify-end gap-y-6">
      <div className="flex w-full flex-col justify-end gap-2 justify-self-end md:flex-row">
        <Link href="#/new-gauge">
          <Button iconLeft={IconType.PLUS} size="sm" variant="primary">
            Create Gauge
          </Button>
        </Link>
      </div>
      <If not={isConnected}>
        <Then>
          <MissingContentView callToAction="Connect wallet" onClick={() => open()}>
            Please connect your wallet to access the gauge section.
          </MissingContentView>
        </Then>
        <ElseIf not={noGauges}>
          <MissingContentView>
            No gauges have been created yet. <br />
            Here you will see the gauges created by the Council before they can be submitted to the community veto
            stage. <If true={canCreate}>Create your first gauge.</If>
          </MissingContentView>
        </ElseIf>
        <Else>
          <DataListRoot
            entityLabel="Projects"
            itemsCount={gaugesWithBPTAndMode.length}
            pageSize={gaugesWithBPTAndMode.length}
            className="mb-12 gap-y-6"
            state={listState}
          >
            <DataListFilter
              searchValue={searchValue}
              activeSort={activeSort}
              onSortChange={pickActiveSort}
              sortItems={sortItems}
              placeholder="Filter projects by name or address"
              onSearchValueChange={(v) => setSearchValue((v ?? "").trim())}
            />
            {gaugesWithBPTAndMode.length > 0 && (
              <div className="hidden gap-x-4 px-6 md:flex">
                <p className="flex w-1/3 flex-row">Name</p>
                <div className="end flex w-1/3 flex-row">
                  <p className="flex w-1/2 justify-end">Total Votes</p>
                </div>
                <p className="w-1/3 flex-auto"></p>
              </div>
            )}
            <DataListContainer emptyFilteredState={emptyState}>
              {gaugesWithBPTAndMode.map((gauge, pos) => (
                <GaugeListItem
                  key={pos}
                  props={gauge}
                  gaugeVotes={gauge.totalVotes}
                  totalVotes={totalVotesBn}
                  selected={!!selectedGauges.find((g) => g.address === gauge.address)}
                />
              ))}
            </DataListContainer>
          </DataListRoot>
        </Else>
      </If>
    </div>
  );
};

export default GaugesList;
