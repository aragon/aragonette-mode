import { PUB_TOKEN_ADDRESS } from "@/constants";
import { proposalList } from "@/features/proposals";
import { useTokenInfo } from "@/plugins/erc20/hooks/useTokenInfo";
import { ProposalSortBy, ProposalSortDir } from "@/server/models/proposals";
import { formatterUtils, NumberFormat, StateSkeletonBar } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";

export const HeaderDao = () => {
  const {
    data: totalProposals,
    isLoading: totalProposalsLoading,
    isFetched: totalProposalsFetched,
    error: totalProposalsError,
  } = useInfiniteQuery({
    ...proposalList({ limit: 6, sortBy: ProposalSortBy.CreatedAt, sortDir: ProposalSortDir.Asc }),
    select: (data) => data.pages[0].pagination.total,
  });
  const totalProposalCountFetched = totalProposalsFetched && !totalProposalsLoading;

  const { data: tokenInfo, isLoading: tokenInfoLoading, error: tokenInfoError } = useTokenInfo(PUB_TOKEN_ADDRESS);

  return (
    <header className="relative flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      {/* Radial gradients */}
      <section className="absolute -top-[18px] right-[80px] -z-10 size-[320px] rounded-full bg-ellipse-34 blur-[120px]" />
      <section className="absolute left-[68px] top-[170px] -z-10 size-[400px] rounded-full bg-ellipse-35 blur-[80px]" />
      <section className="absolute right-[400px] top-[153px] -z-10 size-[540px] rounded-full bg-ellipse-36 blur-[120px]" />

      <div className="flex w-full max-w-screen-xl flex-col gap-y-8 px-4 pb-8 pt-8 md:gap-y-12 md:px-6 md:pt-16">
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-6 md:w-4/5">
            <h1 className="text-4xl leading-tight text-neutral-800 md:text-5xl">Welcome to the Mode Community</h1>
            <p className="text-2xl leading-normal text-neutral-600">
              Welcome to the Mode Governance Hub, responsible for facilitating changes to Mode Protocols. Participate in
              governance by becoming a delegate and voting on MIPs.
            </p>
          </div>
        </div>
        <div className="flex gap-x-20 md:w-4/5">
          {/* Proposal count */}
          {totalProposalCountFetched && !totalProposalsError && (
            <div className="flex flex-col gap-y-1.5">
              <span className="text-4xl text-primary-400">
                {formatterUtils.formatNumber(totalProposals, { format: NumberFormat.GENERIC_SHORT })}
              </span>
              <span className="text-xl text-neutral-500">Proposals</span>
            </div>
          )}
          {totalProposalsLoading && (
            <div className="flex w-24 flex-col justify-between gap-y-3 pb-1 pt-3">
              <StateSkeletonBar size="2xl" className="h-[30px] !bg-neutral-100 py-4" width={"65%"} />
              <StateSkeletonBar size="xl" className="!bg-neutral-100" width={"100%"} />
            </div>
          )}

          {/* Member count */}
          {/* {membersFetched && !totalMembersError && ( */}
          {/* <div className="flex flex-col gap-y-1.5">
              <span className="text-4xl text-neutral-800">
                {formatterUtils.formatNumber(totalMembers, { format: NumberFormat.GENERIC_SHORT })}
              </span>
              <span className="text-xl text-neutral-500">Members</span>
            </div> 
          {/* )} */}
          {/* {membersLoading && ( */}
          {/* <div className="flex w-24 flex-col justify-between gap-y-3 pb-1 pt-3">
            <StateSkeletonBar size="2xl" className="h-[30px] !bg-neutral-100 py-4" width={"65%"} />
            <StateSkeletonBar size="xl" className="!bg-neutral-100" width={"100%"} />
          </div> */}
          {/* )} */}

          {/* Total supply */}
          {tokenInfo && !tokenInfoError && (
            <div className="flex flex-col gap-y-1.5">
              <div className="flex items-baseline gap-x-1">
                <span className="text-4xl text-primary-400">
                  {formatterUtils.formatNumber(formatUnits(tokenInfo[2], tokenInfo[0]), {
                    format: NumberFormat.TOKEN_AMOUNT_SHORT,
                  })}
                </span>
                <span className="line-clamp-1 text-2xl text-neutral-500">{tokenInfo[1]}</span>
              </div>
              <span className="text-xl text-neutral-500">Total supply</span>
            </div>
          )}
          {tokenInfoLoading && (
            <div className="flex w-24 flex-col justify-between gap-y-3 pb-1 pt-3">
              <StateSkeletonBar size="2xl" className="h-[30px] !bg-neutral-100 py-4" width={"65%"} />
              <StateSkeletonBar size="xl" className="!bg-neutral-100" width={"100%"} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
