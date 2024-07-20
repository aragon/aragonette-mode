import { Dashboard } from "@/components/nav/routes";
import { EmptyState } from "@aragon/ods";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex h-full justify-center pb-10">
      <div className="px-6 py-40">
        <EmptyState
          heading="Page not found"
          objectIllustration={{ object: "NOT_FOUND" }}
          description="We couldn't find the page that you're looking for."
          primaryButton={{
            label: "Go to dashboard",
            className: "!rounded-full",
            onClick: () => router.push(Dashboard.path),
          }}
        />
      </div>
    </div>
  );
}
