import { MainSection } from "@/components/layout/mainSection";
import { AccordionContainer, AccordionItem, AccordionItemContent, AccordionItemHeader, Heading } from "@aragon/ods";
import { PostDatList } from "../components/postDataList/postDataList";

export const LearnPage = () => {
  return (
    <>
      <div className="w-full bg-gradient-to-b from-neutral-0 to-transparent px-4 py-6 md:px-16 xl:pt-10">
        <div className="mx-auto flex max-w-screen-lg flex-col gap-y-10 md:gap-y-12">
          <header className="flex flex-col gap-y-3">
            <Heading size="h1">Learn</Heading>
            <p className=" text-neutral-500 md:text-lg">
              Find everything you need to understand Polygon’s governance. Discover the basics, dive into advanced
              topics, and stay updated with the latest developments and best practices in the blockchain world.
            </p>
          </header>
        </div>
      </div>

      <MainSection className="pt:6 md:px-16 md:pb-20">
        <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-y-10 md:gap-y-12">
          <div className="flex flex-col gap-y-3 md:gap-y-4">
            <div className="flex flex-col gap-y-1.5">
              <Heading size="h2">Protocol Governance</Heading>
              <p className="text-neutral-500 md:text-lg">
                Protocol Governance facilitates decentralized maintenance and development of the Polygon tech stack.
              </p>
            </div>
            <PostDatList category="pg" />
          </div>

          <div className="flex flex-col gap-y-3 md:gap-y-4">
            <div className="flex flex-col gap-y-1.5">
              <Heading size="h2">System Smart Contracts Governance</Heading>
              <p className="text-neutral-500 md:text-lg">
                System Smart Contracts Governance facilitates the upgrades of protocol components that are implemented
                as smart contracts
              </p>
            </div>
            <PostDatList category="sscg" />
          </div>

          <div className="flex flex-col gap-y-3 md:gap-y-4">
            <div className="flex flex-col gap-y-1.5">
              <Heading size="h2">Community Treasury Governance</Heading>
              <p className="text-neutral-500 md:text-lg">
                Community Treasury Governance facilitates ecosystem and public goods funding for the longevity of
                Polygon protocols.
              </p>
            </div>
            <PostDatList category="ctg" />
          </div>

          <div className="flex flex-col gap-y-4 md:gap-y-6">
            <AccordionContainer isMulti={false} className="bg-transparent">
              <div className="py-6">
                <Heading size="h2">Glossary & FAQs</Heading>
              </div>
              <AccordionItem value="item-1">
                <AccordionItemHeader className="!items-start text-left text-neutral-500  md:text-lg">
                  What is a PIP?
                </AccordionItemHeader>
                <AccordionItemContent className=" text-neutral-500 md:text-lg">
                  Polygon Improvement Proposals (PIPs) describe community standards for the Polygon ecosystem, including
                  core protocol specifications such as Heimdall and Bor, client APIs, and contract standards, etc.
                </AccordionItemContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionItemHeader className="!items-start text-left text-neutral-500  md:text-lg">
                  Who can submit a PIP?
                </AccordionItemHeader>
                <AccordionItemContent className="text-neutral-500 md:text-lg">Item 2 content</AccordionItemContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionItemHeader className="!items-start text-left text-neutral-500  md:text-lg">
                  What is the difference between the PPGC and the PC?
                </AccordionItemHeader>
                <AccordionItemContent className="text-neutral-500 md:text-lg">Item 3 content</AccordionItemContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionItemHeader className="!items-start text-left text-neutral-500  md:text-lg">
                  How do proposals advance from one stage to the next?
                </AccordionItemHeader>
                <AccordionItemContent className="text-neutral-500 md:text-lg">Item 4 content</AccordionItemContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionItemHeader className="!items-start text-left text-neutral-500  md:text-lg">
                  How do I claim rewards?
                </AccordionItemHeader>
                <AccordionItemContent className="text-neutral-500 md:text-lg">Item 5 content</AccordionItemContent>
              </AccordionItem>
            </AccordionContainer>
          </div>
        </div>
      </MainSection>
    </>
  );
};
