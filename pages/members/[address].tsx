import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { isAddress } from "viem";

interface IMemberProfileParams {
  address?: string;
}

export const getServerSideProps = (async (context) => {
  const { address } = context.params as IMemberProfileParams;

  // if no/invalid address provided, navigate to notfound
  if (address == null || (address != null && !isAddress(address))) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return { props: { address } };
}) satisfies GetServerSideProps<IMemberProfileParams>;

type MemberProfilePageProps = Readonly<InferGetServerSidePropsType<typeof getServerSideProps>>;

export default function MemberProfile({ address }: MemberProfilePageProps) {
  return <div>{`Member Profile - ${address}`}</div>;
}
