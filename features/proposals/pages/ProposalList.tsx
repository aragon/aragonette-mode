import { MainSection } from "@/components/layout/mainSection";
import { NewProposal } from "@/components/nav/routes";
import { ProposalDataList } from "@/features/proposals";
import { Button, Heading, IconType } from "@aragon/ods";
import router from "next/router";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";

export default function Proposals() {
  const { isAuthorized } = useCanCreateProposal();

  return (
    <MainSection className="md:px-6 md:pb-20 xl:pt-10">
      <div className="mx-auto flex w-full max-w-[768px] flex-col items-center gap-y-6 md:px-6">
        <div className="flex w-full gap-x-10">
          <Heading as="h1" className="line-clamp-1 flex flex-1 shrink-0">
            Mode Improvement Proposals
          </Heading>
          {isAuthorized && (
            <Button
              iconLeft={IconType.PLUS}
              size="lg"
              className="!rounded-full"
              onClick={() => {
                router.push(NewProposal.path);
              }}
            >
              Create proposal
            </Button>
          )}
        </div>
        <ProposalDataList />
      </div>
    </MainSection>
  );
}
