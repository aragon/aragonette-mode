import { Heading, Button, IconType } from "@aragon/ods";

export const HeaderProposalCreate: React.FC = () => {
  return (
    <div className="w-full bg-neutral-0">
      <div className="mx-auto flex flex-col gap-y-6 px-4 py-6 md:max-w-[720px] md:px-6 md:py-10">
        <div className="flex flex-col gap-y-2">
          <Heading size="h1">Polygon Improvement Proposals (PIPs)</Heading>
          <p className="text-lg leading-normal text-neutral-500">
            Before you initiate a pull request, please read the PIP-1 and PIP-8 process documents. Ideas should be
            thoroughly discussed on the Polygon Community Forum first. If your proposal is discussing a new contract
            standard, make sure you submit it under the Polygon Request for Comment (PRC) folder
          </p>
        </div>
      </div>
    </div>
  );
};
