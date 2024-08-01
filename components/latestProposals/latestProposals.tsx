import { ProposalDataList } from "@/features/proposals";
import { ProposalSortBy, ProposalSortDir } from "@/server/models/proposals";
import { Heading } from "@aragon/ods";

export const LatestProposals = () => {
  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-3">
        <Heading size="h1">Latest Proposals</Heading>
        <p className="text-base text-neutral-500">
          <strong>Mode Improvement Proposals (MIPs)</strong> are formal proposals that outline specifications and
          reasoning for protocol improvements. During this current phase, MIPs are created, voted upon and passed by a
          designated council. Community feedback is welcome in Discord and more formally in the Forums.
        </p>
      </div>
      <ProposalDataList
        pageSize={3}
        display="overview"
        sortBy={ProposalSortBy.CreatedAt}
        sortDir={ProposalSortDir.Desc}
      />
    </section>
  );
};
