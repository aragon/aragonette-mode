import { PUB_VE_TOKENS_LEARN_MORE_URL } from "@/constants";
import { DataListContainer, DataListFilter, DataListPagination, DataListRoot } from "@aragon/ods";
import { useState } from "react";

import { SectionHeader } from "../section-header";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { Token } from "../../types/tokens";
import { VePositionItem } from "./ve-position-item";
import { filterTokens } from "./utils";
import { useGetCooldownLogs } from "../../hooks/useGetCooldownLogs";

export const StakePositions = () => {
  const [searchValue, setSearchValue] = useState("");
  const { ownedTokens: modeTokensIds, isLoading: modeTokensLoading } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptTokensIds, isLoading: bptTokensLoading } = useOwnedTokens(Token.BPT);

  const { data: cooldownModeLogs, isLoading: cooldownModeLoading } = useGetCooldownLogs(Token.MODE);
  const { data: cooldownBptLogs, isLoading: cooldownBptLoading } = useGetCooldownLogs(Token.BPT);

  const cooldownModeTokens = cooldownModeLogs?.flatMap((log) =>
    log?.args.exitDate
      ? {
          id: BigInt(log?.args.tokenId ?? 0n),
          token: Token.MODE,
        }
      : []
  );
  const cooldownBptTokens = cooldownBptLogs?.flatMap((log) =>
    log?.args.exitDate
      ? {
          id: BigInt(log?.args.tokenId ?? 0n),
          token: Token.BPT,
        }
      : []
  );

  const modeTokens = modeTokensIds?.map((id) => {
    return {
      id: BigInt(id),
      token: Token.MODE,
    };
  });

  const bptTokens = bptTokensIds?.map((id) => {
    return {
      id: BigInt(id),
      token: Token.BPT,
    };
  });

  const isLoading = modeTokensLoading || bptTokensLoading || cooldownModeLoading || cooldownBptLoading;
  const allVeTokens = [
    ...(modeTokens ?? []),
    ...(bptTokens ?? []),
    ...(cooldownModeTokens ?? []),
    ...(cooldownBptTokens ?? []),
  ];

  allVeTokens.sort((a, b) => {
    console.log(a.id, b.id);
    return Number(b.id - a.id);
  });

  // Remove duplicates
  const veTokens = allVeTokens.filter((veToken, index, self) => {
    return index === self.findIndex((t) => t.id === veToken.id && t.token === veToken.token);
  });

  const filteredVeTokens = filterTokens(veTokens, searchValue);

  return (
    <>
      <SectionHeader title="Your ve Tokens" learnMoreUrl={PUB_VE_TOKENS_LEARN_MORE_URL}>
        Your staked MODE and/or BPT tokens are represented as veTokens. If you want to unstake your MODE and/or BPT
        tokens, they will be available within 7 days after entering the cooldown.
      </SectionHeader>

      <div className="mt-8">
        <DataListRoot
          entityLabel="veTokens"
          itemsCount={filteredVeTokens.length}
          pageSize={5}
          className="gap-y-6"
          state={isLoading ? "initialLoading" : "idle"}
        >
          <DataListFilter
            searchValue={searchValue}
            placeholder="Filter by token ID or token name"
            onSearchValueChange={(v) => setSearchValue((v ?? "").trim())}
          />

          <div className="hidden gap-x-4 px-4 md:flex">
            <div className="w-16 flex-auto">Token ID</div>
            <div className="w-32 flex-auto">Amount</div>
            <div className="w-32 flex-auto">Multiplier</div>
            <div className="w-32 flex-auto">Age</div>
            <div className="w-48 flex-auto">Status</div>
          </div>

          <DataListContainer>
            {filteredVeTokens.length === 0 && <div className="text-neutral-500">No veTokens found</div>}
            {filteredVeTokens.map((veToken, pos) => (
              <VePositionItem key={pos} props={veToken} />
            ))}
          </DataListContainer>

          <DataListPagination />
        </DataListRoot>
      </div>
    </>
  );
};
