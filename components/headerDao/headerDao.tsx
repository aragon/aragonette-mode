import { proposalList } from "@/features/proposals";
import { ProposalSortBy, ProposalSortDir } from "@/server/models/proposals";
import { chakraPetch } from "@/utils/fonts";
import { formatterUtils, NumberFormat, StateSkeletonBar } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";

export const HeaderDao = () => {
  const {
    data: totalProposals,
    isLoading: totalProposalsLoading,
    isFetched: totalProposalsFetched,
    error: totalProposalsError,
  } = useInfiniteQuery({
    ...proposalList({ limit: 6, sortBy: ProposalSortBy.CreatedAt, sortDir: ProposalSortDir.Desc }),
    select: (data) => data.pages[0].pagination.total,
  });
  const totalProposalCountFetched = totalProposalsFetched && !totalProposalsLoading;

  return (
    <header className="relative flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      {/* Radial gradients */}
      <section className="absolute -top-[36px] -z-10 size-[180px] rounded-full bg-ellipse-37 blur-[120px] sm:right-[80px] sm:size-[320px]" />
      <section className="absolute left-[68px] top-[170px] -z-10 size-[250px] rounded-full bg-ellipse-38 blur-[80px] sm:size-[400px]" />
      <section className="absolute right-[400px] top-[153px] -z-10 hidden size-[540px] rounded-full bg-ellipse-39 blur-[120px] lg:block" />

      <div className="flex w-full max-w-screen-xl flex-col gap-y-8 px-4 pb-8 pt-8 md:gap-y-12 md:px-6 md:pt-16">
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-2 md:w-4/5">
            <h1 className="text-4xl leading-tight text-neutral-800 md:text-5xl">Welcome to the Mode Community</h1>
            <p className="text-2xl leading-normal text-neutral-600">
              The Mode Governance Hub is the home for the Mode community to participate in Mode&apos;s evolving
              Governance. Mode builds infrastructure, assets, and applications with a mission to bring decentralized
              finance to billions of users globally. Welcome to Mode, governed on Aragon.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-x-20 gap-y-6 sm:flex-row md:w-4/5">
          {/* Proposal count */}
          {totalProposalCountFetched && totalProposals != null && !totalProposalsError && (
            <div className="flex flex-col">
              <span
                className="text-3xl text-primary-400 md:text-4xl"
                style={{ fontFamily: chakraPetch.style.fontFamily }}
              >
                {formatterUtils.formatNumber(totalProposals, { format: NumberFormat.GENERIC_SHORT })}
              </span>
              <span className="text-xl text-neutral-500">{totalProposals === 1 ? "Proposal" : "Proposals"}</span>
            </div>
          )}
          {totalProposalsLoading && (
            <div className="flex w-24 flex-col justify-between gap-y-3 pb-1 pt-3">
              <StateSkeletonBar size="2xl" className="h-[30px] !bg-neutral-100 py-4" width={"65%"} />
              <StateSkeletonBar size="xl" className="!bg-neutral-100" width={"100%"} />
            </div>
          )}

          {/* TVL */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-x-1">
              <span
                className="text-3xl text-primary-400 md:text-4xl"
                style={{ fontFamily: chakraPetch.style.fontFamily }}
              >
                $500M
              </span>
            </div>
            <span className="text-xl text-neutral-500">TVL</span>
          </div>

          {/* Token holders */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-x-1">
              <span
                className="text-3xl text-primary-400 md:text-4xl"
                style={{ fontFamily: chakraPetch.style.fontFamily }}
              >
                {formatterUtils.formatNumber(96500, {
                  format: NumberFormat.GENERIC_SHORT,
                })}
                +
              </span>
            </div>
            <span className="text-xl text-neutral-500">Token holders</span>
          </div>
        </div>
      </div>
    </header>
  );
};
