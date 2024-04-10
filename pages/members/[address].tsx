import { MainSection } from "@/components/layout/mainSection";
import { SectionView } from "@/components/layout/sectionView";
import { type GetServerSideProps, type InferGetServerSidePropsType } from "next";
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
  return (
    <MainSection>
      <SectionView>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl text-neutral-800">Member Profile</h1>
          <div>
            <div>{`Member Address -> ${address}`}</div>;
          </div>
        </div>
      </SectionView>
    </MainSection>
  );
}
