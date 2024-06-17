import { PUB_CHAIN } from "@/constants";
import { formatHexString } from "@/utils/evm";
import { generateBreadcrumbs } from "@/utils/nav";
import { CardCollapsible, Heading, IconType, Link } from "@aragon/ods";
import { useRouter } from "next/router";
import { type Address } from "viem";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { HeaderMember } from "../components/headerMember/headerMember";
import { MemberVotesDataList } from "../components/memberVotesDataList/memberVotesDataList";

export const DelegateProfile = () => {
  const { query, asPath } = useRouter();
  const address = query.address as string;
  const breadcrumbs = generateBreadcrumbs(asPath);

  const formattedAddress = formatHexString(address);
  const { data: ensName } = useEnsName({ chainId: mainnet.id, address: address as Address });

  return (
    <div className="flex flex-col items-center">
      <HeaderMember breadcrumbs={breadcrumbs} address={address} />
      <div className="flex w-full max-w-screen-xl gap-x-16 gap-y-6 px-4 py-6 md:px-16 md:pb-20 md:pt-12">
        {/* Main section */}
        <div className="flex w-[720px] flex-col gap-y-20">
          {/* Delegation Statement */}
          {/* TODO: update to proper component */}
          <div className="flex w-full flex-col gap-y-6">
            <Heading size="h2">Delegation statement</Heading>
            <CardCollapsible
              buttonLabelClosed="Read more"
              buttonLabelOpened="Read less"
              collapsedSize="md"
              className="shadow-neutral"
            >
              This is the statement
            </CardCollapsible>
            {/* Delegations Received */}
            {/* TODO: update to proper component */}
            <div>Delegations received</div>
          </div>

          <div className="flex w-full flex-col gap-y-6">
            {/* Voting activity */}
            <Heading size="h2">Voting activity</Heading>
            <MemberVotesDataList address={address} />
          </div>

          <div className="flex w-full flex-col gap-y-6">
            {/* Proposal creation */}
            {/* TODO: update to proper component */}
            <Heading size="h2">Proposal creation</Heading>
          </div>
        </div>
        {/* Aside */}
        <aside className="flex max-w-[320px] flex-1 flex-col gap-y-6">
          <div className="flex flex-col gap-y-1">
            <Heading size="h3">Details</Heading>
            <dl className="divide-y divide-neutral-100">
              <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
                <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                  Address
                </dt>
                <dd className="size-full text-base leading-tight text-neutral-500">
                  <Link
                    iconRight={IconType.LINK_EXTERNAL}
                    target="_blank"
                    rel="noopener"
                    href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${address}`}
                  >
                    {formattedAddress}
                  </Link>
                </dd>
              </div>
              {ensName && (
                <div className="flex items-baseline border py-3 md:gap-x-6 md:py-4">
                  <dt className="line-clamp-1 shrink-0 border text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                    Ens
                  </dt>
                  <dd className="size-full border text-base leading-tight text-neutral-500">
                    <Link
                      iconRight={IconType.LINK_EXTERNAL}
                      target="_blank"
                      rel="noopener"
                      href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${address}`}
                    >
                      {ensName}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
};
