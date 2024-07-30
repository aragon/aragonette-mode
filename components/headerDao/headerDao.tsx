import { Button } from "@aragon/ods";
import { useRouter } from "next/navigation";
import { Learn } from "../nav/routes";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { proposalList } from "@/features/proposals";
import { councilMemberList, delegatesList } from "@/features/membership/services/query-options";

export const HeaderDao = () => {
  const router = useRouter();

  const { data: proposalsQueryData, isLoading } = useInfiniteQuery(proposalList({ limit: 1 }));
  const { data: councilMemberListData, isLoading: councilMembersLoading } = useQuery(councilMemberList());
  const { data: delegatesListData, isLoading: delegatesLoading } = useInfiniteQuery(delegatesList({ limit: 1 }));

  const stats = [
    { value: proposalsQueryData?.pagination.total, label: "Proposals" },
    { value: (councilMemberListData?.length ?? 0) + (delegatesListData?.pagination.total ?? 0), label: "Members" },
  ];

  return (
    <header className="relative z-[5] flex w-full justify-center">
      <div className="flex w-full max-w-screen-xl flex-col gap-y-8 px-4 pb-8 pt-8 md:gap-y-12 md:px-6 md:pt-16">
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-6 md:w-4/5">
            <h1 className="text-4xl leading-tight text-neutral-800 md:text-5xl">Polygon Governance Hub</h1>
            <p className="text-2xl leading-normal text-neutral-600">
              Welcome to the Polygon Governance Hub, responsible for facilitating changes to Polygon Protocols.
              Participate in governance by becoming a delegate and voting on PIPs.
            </p>
          </div>
        </div>
        <div className="flex gap-x-20 md:w-4/5">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-y-1.5">
              <span className="text-4xl text-neutral-800">{s.value}</span>
              <span className="text-xl text-neutral-500">{s.label}</span>
            </div>
          ))}
        </div>
        <span className="flex flex-col gap-x-4 gap-y-3 md:flex-row">
          <Button className="!rounded-full" variant="primary" size="lg">
            Create delegate profile
          </Button>
          <Button
            className="!rounded-full"
            variant="secondary"
            size="lg"
            onClick={() => {
              router.push(Learn.path);
            }}
          >
            Learn more
          </Button>
        </span>
      </div>
    </header>
  );
};
