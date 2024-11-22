import { DataListContainer, DataListFilter, DataListRoot, type DataListState, IconType } from "@aragon/ods";
import { useEffect, useMemo, useState } from "react";
import { useGetGauges } from "../../hooks/useGetGauges";
import { GaugeListItem } from "./gauge-item";
import { type GaugeMetadata, type GaugeItem } from "./types";
import { Token } from "../../types/tokens";
import { useGetGaugesInfo } from "../../hooks/useGetGaugesInfo";
import { type Address } from "viem";
import { VotingBar } from "../voting-bar";
import { useGetGaugeMetadata } from "../../hooks/useGetGaugeMetadata";
import { useGetTotalGaugeVotes } from "../../hooks/useGetTotalGaugeVotes";
import { useGetGaugeVotesMulti } from "../../hooks/useGetGaugeVotesMulti";
import { useUserVotesData } from "../../hooks/useUserVotesData";

export const StakePositions = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedGauges, setSelectedGauges] = useState<GaugeItem[]>([]);
  const [activeSort, setActiveSort] = useState("user_votes_desc");
  const [listState, setListState] = useState<DataListState>();

  const sortItems = useMemo(
    () => [
      {
        value: "user_votes_desc",
        label: "Your votes",
        type: "DESC" as const,
      },
      { value: "votes_desc", label: "Total votes", type: "DESC" as const },
    ],
    []
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

  const { data: userVotesData } = useUserVotesData(
    [Token.BPT, Token.MODE],
    [
      allGauges.filter((gauge) => gauge.token === Token.BPT).map((gauge) => gauge.address),
      allGauges.filter((gauge) => gauge.token === Token.MODE).map((gauge) => gauge.address),
    ]
  );

  const gaugesWithBPTAndMode = filteredGauges
    .map((gauge) => {
      const BPTVotes = bptGaugeVotesData?.find((v) => v?.address === gauge.address)?.amount ?? 0n;
      const modeVotes = modeGaugeVotesData?.find((v) => v?.address === gauge.address)?.amount ?? 0n;
      console.log(modeVotes, BPTVotes);
      const totalVotes = BigInt(BPTVotes + modeVotes);
      const userBPTVotes = userVotesData?.find(
        (v) => v?.gaugeAddress === gauge.address && v?.token === Token.BPT
      )?.votes;
      const userModeVotes = userVotesData?.find(
        (v) => v?.gaugeAddress === gauge.address && v?.token === Token.MODE
      )?.votes;
      const userVotes = BigInt((userBPTVotes ?? 0n) + (userModeVotes ?? 0n));

      return {
        ...gauge,
        BPTVotes,
        modeVotes,
        userBPTVotes,
        userModeVotes,
        totalVotes,
        userVotes,
      };
    })
    .sort((a, b) => {
      if (activeSort === "user_votes_desc") return a.userVotes > b.userVotes ? -1 : 1;
      if (activeSort === "votes_desc") return a.totalVotes > b.totalVotes ? -1 : 1;
      return a.totalVotes > b.totalVotes ? -1 : 1;
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
    <div className="mt-8">
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
          onSortChange={setActiveSort}
          sortItems={sortItems}
          placeholder="Filter projects by name or address"
          onSearchValueChange={(v) => setSearchValue((v ?? "").trim())}
        />
        {gaugesWithBPTAndMode.length > 0 && (
          <div className="hidden gap-x-4 px-6 md:flex">
            <p className="flex w-1/6 flex-row">Name</p>
            <div className="end flex w-3/6 flex-row">
              <p className="flex w-1/2 justify-end">Total Votes</p>
              <p className="flex w-1/2 justify-end">Your Votes</p>
            </div>
            <p className="w-1/6 flex-auto"></p>
          </div>
        )}
        <DataListContainer emptyFilteredState={emptyState}>
          {gaugesWithBPTAndMode.map((gauge, pos) => (
            <GaugeListItem
              key={pos}
              props={gauge}
              gaugeVotes={gauge.totalVotes}
              totalVotes={totalVotesBn}
              userBPTVotes={gauge.userBPTVotes}
              userModeVotes={gauge.userModeVotes}
              selected={!!selectedGauges.find((g) => g.address === gauge.address)}
              onSelect={(selected) => {
                setSelectedGauges((selectedGauges) => {
                  const cleanedGauges = selectedGauges.filter((g) => g.address !== gauge.address);
                  if (selected) {
                    cleanedGauges.splice(pos, 0, gauge);
                  }
                  return cleanedGauges;
                });
              }}
            />
          ))}
        </DataListContainer>
      </DataListRoot>
      <VotingBar
        selectedGauges={selectedGauges}
        onRemove={(gauge) => {
          const index = selectedGauges.findIndex((g) => g.address === gauge.address);
          if (index !== -1) setSelectedGauges(selectedGauges.filter((_, i) => i !== index));
        }}
      />
    </div>
  );
};
