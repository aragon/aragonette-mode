import { MainSection } from "@/components/layout/mainSection";
import { SectionView } from "@/components/layout/sectionView";
import { ProposalDetails } from "@/components/nav/routes";
import { proposalList } from "@/features/proposals";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Proposals() {
  const { data: pips } = useQuery({ ...proposalList("unknown"), enabled: false });

  return (
    <MainSection>
      <SectionView>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl text-neutral-800">Proposal List Page</h1>
          <div>
            {pips?.map((pip) => (
              <div key={pip.id}>
                <Link
                  href={ProposalDetails.getPath(pip.id)}
                >{`${pip.title} - ${pip.description} - ${pip.status}`}</Link>
              </div>
            ))}
          </div>
        </div>
      </SectionView>
    </MainSection>
  );
}
