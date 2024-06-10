import { PUB_CHAIN } from "@/constants";
import { formatHexString } from "@/utils/evm";
import { type IResource } from "@/utils/types";
import { Heading, IconType, Link } from "@aragon/ods";
import React from "react";
import { type Address } from "viem";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";

interface IDelegateAsideProps {
  address: string;
}

export const DelegateAside: React.FC<IDelegateAsideProps> = (props) => {
  const { address } = props;

  const { data: ensName } = useEnsName({ chainId: mainnet.id, address: address as Address });

  const formattedAddress = formatHexString(address);
  const links: IResource[] = [
    { name: "Twitter", link: "https://twitter.com/yourProfile" },
    { name: "Farcaster", link: "https://warpcast.com/your_profile.eth" },
    { name: "Github", link: "https://github.com/your_profile" },
  ];

  const explorerUrl = `${PUB_CHAIN.blockExplorers?.default.url}/address/${address}`;

  return (
    <aside className="flex max-w-[320px] flex-1 flex-col gap-y-20">
      <div className="flex flex-col gap-y-1">
        <Heading size="h3">Details</Heading>
        <dl className="divide-y divide-neutral-100">
          <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
            <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
              Address
            </dt>
            <dd className="size-full text-base leading-tight text-neutral-500">
              <Link iconRight={IconType.LINK_EXTERNAL} target="_blank" rel="noopener" href={explorerUrl}>
                {formattedAddress}
              </Link>
            </dd>
          </div>
          {ensName && (
            <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Ens
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">
                <Link iconRight={IconType.LINK_EXTERNAL} target="_blank" rel="noopener" href={explorerUrl}>
                  {ensName}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </div>
      <div className="flex flex-col gap-y-4">
        <Heading size="h3">Links</Heading>
        {links.map(({ name, link }) => (
          <Link
            key={link}
            href={link}
            description={link}
            iconRight={IconType.LINK_EXTERNAL}
            target="_blank"
            rel="noopener"
          >
            {name}
          </Link>
        ))}
      </div>
    </aside>
  );
};
