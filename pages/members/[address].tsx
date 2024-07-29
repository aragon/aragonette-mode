import { MemberProfile } from "@/features/membership/pages/MemberProfile";

import { getEnsAvatar, getEnsName } from "@wagmi/core";
import { Address } from "viem";

import { PUB_ENS_CHAIN } from "@/constants";
import { config } from "@/components/walletContainer/walletContainer";

export const getServerSideProps = async (context: any) => {
  const address = context.query.address as Address;

  const name = await getEnsName(config, {
    address,
    chainId: PUB_ENS_CHAIN.id,
  });

  if (!name)
    return {
      props: {
        ensData: null,
      },
    };

  const image = await getEnsAvatar(config, {
    name,
    chainId: PUB_ENS_CHAIN.id,
  });

  return {
    props: {
      ensData: {
        name,
        image,
      },
    },
  };
};

export default function Profile({ ensData }: { ensData: { name: string; image: string } }) {
  return <MemberProfile ensData={ensData} />;
}
