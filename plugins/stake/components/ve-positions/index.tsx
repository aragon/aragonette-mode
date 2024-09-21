import { Card, DataListContainer, DataListFilter, DataListRoot } from "@aragon/ods";
import { PUB_VE_TOKENS_LEARN_MORE_URL } from "@/constants";
import { Fragment, useState } from "react";
import { getSimpleRelativeTimestamp } from "@/utils/dates";

import { SectionHeader } from "../section-header";
import { type VeTokenItem } from "./types";
import { epochsSince, getVisibleTokens } from "./utils";
import Image from "next/image";
import { TokenStatusCell } from "./token-status-pill";

const TEST_VE_TOKEN_POSITIONS: VeTokenItem[] = [
  {
    id: "501",
    amount: BigInt(1234),
    token: "BPT",
    multiplyer: 2.5,
    created: Date.now() - 1000 * 60 * 60 * 24 * 7,
    status: "in-cooldown",
  },
  {
    id: "505",
    amount: BigInt(300),
    token: "MODE",
    multiplyer: 3.5,
    created: Date.now() - 1000 * 60 * 60 * 24 * 15,
    status: "claimable",
  },
  {
    id: "507",
    amount: BigInt(422),
    token: "BPT",
    multiplyer: 4.1,
    created: Date.now() - 1000 * 60 * 60 * 24 * 19,
    status: "claimable",
  },
];

export const StakePositions = () => {
  const [searchValue, setSearchValue] = useState("");
  const [allVeTokens, setAllVeTokens] = useState<VeTokenItem[]>(TEST_VE_TOKEN_POSITIONS);

  const veTokens = getVisibleTokens(allVeTokens, searchValue);

  return (
    <>
      <SectionHeader title="Your ve Tokens" learnMoreUrl={PUB_VE_TOKENS_LEARN_MORE_URL}>
        Your staked MODE and/or BPT tokens are represented as veTokens. If you want to unstake your MODE and/or BPT
        tokens, they will be available within 7 days after entering the cooldown.
      </SectionHeader>

      <div className="mt-8">
        <DataListRoot entityLabel="Users" className="gap-y-6">
          <DataListFilter
            searchValue={searchValue}
            placeholder="Filter by staked position or amount"
            onSearchValueChange={(v) => setSearchValue((v || "").trim())}
          />

          <div className="hidden gap-x-4 px-4 md:flex">
            <div className="w-16 flex-auto">Token ID</div>
            <div className="w-32 flex-auto">Amount</div>
            <div className="w-32 flex-auto">Multiplier</div>
            <div className="w-32 flex-auto">Age</div>
            <div className="w-48 flex-auto">Status</div>
          </div>

          <DataListContainer>
            {veTokens.map((item, idx) => {
              const strEpochs = epochsSince(item.created);
              const relativeTime = getSimpleRelativeTimestamp(item.created);

              return (
                <Fragment key={idx}>
                  <div className="hidden md:block">
                    <Card className="flex items-center gap-x-4 border border-neutral-100 p-4">
                      <div className="flex w-16 flex-auto items-center gap-x-3">
                        <Image
                          className="w-8"
                          alt="Token icon"
                          width={32}
                          height={32}
                          src={item.token === "MODE" ? "/mode-token-icon.png" : "/bpt-token-icon.png"}
                        />
                        {item.id}
                      </div>
                      <div className="w-32 flex-auto">
                        {item.amount.toString()} {item.token}
                      </div>
                      <div className="w-32 flex-auto">{item.multiplyer}x</div>
                      <div className="w-32 flex-auto">
                        {strEpochs} {strEpochs === "1" ? "epoch" : "epochs"}
                        <br />
                        <small className="text-neutral-200">{relativeTime}</small>
                      </div>
                      <div className="w-48 flex-auto">
                        <TokenStatusCell id={item.id} />
                      </div>
                    </Card>
                  </div>
                  <div className="md:hidden">
                    <Card className="my-2 border border-neutral-100 px-4 py-2">
                      <dl className="flex flex-col divide-y divide-neutral-100">
                        <div className="flex justify-between py-2">
                          <div className="flex items-center gap-x-4">
                            <Image
                              className="w-8"
                              alt="Token icon"
                              width={32}
                              height={32}
                              src={item.token === "MODE" ? "/mode-token-icon.png" : "/bpt-token-icon.png"}
                            />
                            {item.id}
                          </div>
                          <div>
                            {item.amount.toString()} {item.token}
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="">
                            <small>MULTIPLYER</small>
                            <br />
                            {item.multiplyer}x
                          </div>
                          <div className="text-right">
                            <small>AGE</small>
                            <br />
                            {strEpochs} {strEpochs === "1" ? "epoch" : "epochs"}&nbsp;&nbsp;
                            <small className="text-neutral-200">{relativeTime}</small>
                          </div>
                        </div>

                        <div className="py-2">
                          <TokenStatusCell id={item.id} />
                        </div>
                      </dl>

                      {/* <div className="flex w-16 flex-auto items-center gap-x-3">
                        <img
                          className="w-8"
                          src={item.token === "MODE" ? "/mode-token-icon.png" : "/bpt-token-icon.png"}
                        />
                        {item.id}
                      </div>
                      <div className="w-32 flex-auto">
                        {item.amount.toString()} {item.token}
                      </div>
                      <div className="w-32 flex-auto">{item.multiplyer}x</div>
                      <div className="w-32 flex-auto">
                        {strEpochs} {strEpochs === "1" ? "epoch" : "epochs"}
                        <br />
                        <small className="text-neutral-200">{relativeTime}</small>
                      </div>
                      <div className="w-48 flex-auto">
                        <TokenStatusCell id={item.id} />
                      </div> */}
                    </Card>
                  </div>
                </Fragment>
              );
            })}
          </DataListContainer>
        </DataListRoot>
      </div>
    </>
  );
};
