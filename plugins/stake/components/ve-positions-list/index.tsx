import { DataListContainer, DataListFilter, DataListRoot } from "@aragon/ods";
import { PUB_VE_TOKENS_LEARN_MORE_URL } from "@/constants";
import { useState } from "react";

import { SectionHeader } from "../section-header";
//import { getVisibleTokens } from "./utils";
import { VePositionItem } from "./ve-position-item";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { Token } from "../../types/tokens";

export const StakePositions = () => {
  const [searchValue, setSearchValue] = useState("");
  const { ownedTokens: modeTokensIds } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptTokensIds } = useOwnedTokens(Token.BPT);

  const modeTokens = modeTokensIds?.map((id) => {
    return {
      id: id,
      token: Token.MODE,
    };
  });

  const bptTokens = bptTokensIds?.map((id) => {
    return {
      id: id,
      token: Token.BPT,
    };
  });

  const allVeTokens = [...(modeTokens ?? []), ...(bptTokens ?? [])];

  //allVeTokens.sort((a, b) => {
  //  return Number(a.id - b.id);
  //});

  const veTokens = allVeTokens; //getVisibleTokens(allVeTokens, searchValue);

  return (
    <>
      <SectionHeader title="Your ve Tokens" learnMoreUrl={PUB_VE_TOKENS_LEARN_MORE_URL}>
        Your staked MODE and/or BPT tokens are represented as veTokens. If you want to unstake your MODE and/or BPT
        tokens, they will be available within 7 days after entering the cooldown.
      </SectionHeader>

      <div className="mt-8">
        <DataListRoot entityLabel="veTokens" className="gap-y-6">
          <DataListFilter
            searchValue={searchValue}
            placeholder="Filter by staked position or amount"
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
            {veTokens.length === 0 && <div className="text-neutral-500">No veTokens found</div>}
            {veTokens.map((veToken, pos) => (
              <VePositionItem key={pos} props={veToken} />
            ))}
          </DataListContainer>
        </DataListRoot>
      </div>
    </>
  );
};
