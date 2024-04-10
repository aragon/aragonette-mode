import { MainSection } from "@/components/layout/mainSection";
import { SectionView } from "@/components/layout/sectionView";
import { useRouter } from "next/router";

export default function ProposalDetails() {
  const router = useRouter();

  return (
    <MainSection>
      <SectionView>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl text-neutral-800">Proposal Details</h1>
          <div>
            <div>{`Proposal Id -> ${router.query.id}`}</div>;
          </div>
        </div>
      </SectionView>
    </MainSection>
  );
}
