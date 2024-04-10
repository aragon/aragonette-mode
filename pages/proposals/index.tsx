import { MainSection } from "@/components/layout/mainSection";
import { SectionView } from "@/components/layout/sectionView";
import { ProposalDetails } from "@/components/nav/routes";
import Link from "next/link";

export default function Proposals() {
  const mockPips = [
    { id: 32, title: "PIP 32 - Ancient data pruning" },
    { id: 33, title: "PIP 33 - Napoli" },
  ];

  return (
    <MainSection>
      <SectionView>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl text-neutral-800">Proposal List Page</h1>
          <div>
            {mockPips.map((pip) => (
              <div key={pip.id}>
                <Link href={ProposalDetails.getPath(pip.id)}>{pip.title}</Link>
              </div>
            ))}
          </div>
        </div>
      </SectionView>
    </MainSection>
  );
}
