import { ProposalDataList } from "@/features/proposals";
import { ProposalSortBy, ProposalSortDir } from "@/server/models/proposals";
import { Heading, IconType, Link } from "@aragon/ods";

export const LatestPIPs = () => {
  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-3">
        <Heading size="h1">Latest PIPs</Heading>
        <p className="text-base text-neutral-500">
          <strong>Polygon Improvement Proposals (PIPs)</strong> are documents that describe standards for the Polygon
          ecosystem and the processes through which the Polygon community introduces, finds consensus on, and implements
          changes to Polygon Protocols.
        </p>
        <Link iconRight={IconType.LINK_EXTERNAL}>Learn more</Link>
      </div>
      <ProposalDataList
        pageSize={4}
        display="overview"
        sortBy={ProposalSortBy.CreatedAt}
        sortDir={ProposalSortDir.Desc}
      />
    </section>
  );
};
