import { ProposalDataList } from "@/features/proposals";
import { Button, Heading, IconType } from "@aragon/ods";

export default function Proposals() {
  return (
    <div className="flex max-w-screen-md flex-col items-center gap-y-6 md:px-6">
      <div className="flex w-full gap-x-10">
        <Heading as="h1" className="line-clamp-1 flex flex-1 shrink-0">
          Polygon Improvement Proposals
        </Heading>
        <Button iconLeft={IconType.PLUS} size="lg">
          Onchain PIP
        </Button>
      </div>
      <ProposalDataList />
    </div>
  );
}
