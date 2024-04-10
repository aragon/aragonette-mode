import { MainSection } from "@/components/layout/mainSection";
import { SectionView } from "@/components/layout/sectionView";
import { Card, EmptyState } from "@aragon/ods";

export default function Learn() {
  return (
    <MainSection>
      <SectionView>
        <Card className="w-full">
          <EmptyState
            className="w-full md:w-full lg:w-full xl:w-full"
            heading="🚧 This page is currently under construction. 🚧🏗️"
            humanIllustration={{
              body: "BLOCKS",
              expression: "SMILE",
              hairs: "CURLY",
            }}
          />
        </Card>
      </SectionView>
    </MainSection>
  );
}
