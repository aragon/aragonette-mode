import { DataListContainer, DataListFilter, DataListRoot, type DataListState, IconType } from "@aragon/ods";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAccount } from "wagmi";
import { useGetGaugeRewards } from "../../hooks/useGetGaugeRewards";
import { type ProposalDatum } from "@/server/utils/api/types";

export const StakePositions = () => {
  const { address } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const [selectedGauges, setSelectedGauges] = useState<GaugeItem[]>([]);
  const [activeSort, setActiveSort] = useState<string>();
  const [listState, setListState] = useState<DataListState>();

  const sortItems = useMemo(
    () => [
      { value: "votes_desc", label: "Total votes", type: "DESC" as const },
      { value: "rewards_desc", label: "Rewards", type: "DESC" as const },
      ...(address ? [{ value: "user_votes_desc", label: "Your votes", type: "DESC" as const }] : []),
    ],
    [address]
  );

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

  useEffect(() => {
    if (address) {
      setActiveSort("user_votes_desc");
    }
  }, [address]);

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
      gauge.metadata?.name?.toLowerCase().includes(searchValue.toLowerCase()) ??
      gauge.address.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const { data: modeGaugeVotesData } = useGetGaugeVotesMulti(
    Token.MODE,
    allGauges.filter((gauge) => gauge.token === Token.MODE).map((gauge) => gauge.address)
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

  const { data: modeRewardsData } = useGetGaugeRewards(Token.MODE);
  const { data: bptRewardsData } = useGetGaugeRewards(Token.BPT);

  const gaugesWithBPTAndMode = filteredGauges
    .map((gauge) => {
      const BPTVotes = bptGaugeVotesData?.find((v) => v?.address === gauge.address)?.amount ?? 0n;
      const modeVotes = modeGaugeVotesData?.find((v) => v?.address === gauge.address)?.amount ?? 0n;
      const totalVotes = BigInt(BPTVotes + modeVotes);
      const userBPTVotes = userVotesData?.find(
        (v) => v?.gaugeAddress === gauge.address && v?.token === Token.BPT
      )?.votes;
      const userModeVotes = userVotesData?.find(
        (v) => v?.gaugeAddress === gauge.address && v?.token === Token.MODE
      )?.votes;
      const userVotes = BigInt((userBPTVotes ?? 0n) + (userModeVotes ?? 0n));
      const modeRewards = modeRewardsData?.find((v) => v.proposal.toLowerCase() === gauge.address.toLowerCase());
      const bptRewards = bptRewardsData?.find((v) => v.proposal.toLowerCase() === gauge.address.toLowerCase());
      const totalRewards = (modeRewards?.totalValue ?? 0) + (bptRewards?.totalValue ?? 0);

      return {
        ...gauge,
        BPTVotes,
        modeVotes,
        userBPTVotes,
        userModeVotes,
        totalVotes,
        userVotes,
        modeRewards,
        bptRewards,
        totalRewards,
      };
    })
    .sort((a, b) => {
      if (activeSort === "rewards_desc") return (a?.totalRewards ?? 0) > (b?.totalRewards ?? 0) ? -1 : 1;
      if (activeSort === "user_votes_desc") return a.userVotes > b.userVotes ? -1 : 1;
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

  useEffect(() => {
    if (!address) {
      setSelectedGauges([]);
    }
  }, [address]);

  return (
    <div className="mt-8">
      <DataListRoot
        entityLabel="Projects"
        itemsCount={gaugesWithBPTAndMode.length}
        pageSize={gaugesWithBPTAndMode.length}
        className="mb-12"
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
          <div className="hidden gap-x-4 px-6 lg:grid lg:grid-cols-12">
            <p className="lg:col-span-3">Name</p>
            <p className="text-end lg:col-span-2">Rewards</p>
            <p className="text-end lg:col-span-2">Total Votes</p>
            <p className="text-end lg:col-span-2">Your Votes</p>
            <div className="lg:col-span-3"></div>
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
              bptRewards={gauge.bptRewards}
              modeRewards={gauge.modeRewards}
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
