import React from "react";
import { MainSection } from "@/components/layout/main-section";
import { Button, Card, IllustrationHuman } from "@aragon/ods";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardResources } from "@/components/dashboard/resources";

export default function StandardHome() {
  const proposalCount = 0;

  return (
    <>
      <MainSection>
        <DashboardHeader count={proposalCount} />
        <DashboardResources />
      </MainSection>
      <ConnectWidget />
    </>
  );
}

// helpers

const ConnectWidget = () => {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  if (isConnected) return null;

  return (
    <MainSection narrow>
      <Card className="flex flex-col justify-between gap-y-6 bg-neutral-0 p-6 shadow-neutral-md">
        <h1 className="line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Connect your wallet
        </h1>
        <p className="text-md text-neutral-400">
          Get started by connecting your wallet and selecting a section from the menu.
        </p>
        <div className="">
          <IllustrationHuman className="mx-auto mb-10 max-w-96" body="BLOCKS" expression="SMILE_WINK" hairs="CURLY" />
          <div className="flex justify-center">
            <Button size="md" variant="primary" onClick={() => open()}>
              <span>Connect wallet</span>
            </Button>
          </div>
        </div>
      </Card>
    </MainSection>
  );
};
