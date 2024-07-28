import { EmptyState } from "@aragon/ods";
import router from "next/router";
import { Dashboard } from "./nav/routes";

export function NotFound({ message }: { message?: string }) {
  return (
    <main className="flex h-full flex-1 justify-center py-24">
      <EmptyState
        heading="Page not found"
        objectIllustration={{ object: "NOT_FOUND" }}
        description="We couldn't find the page that you're looking for."
        primaryButton={{
          label: "Go home",
          className: "!rounded-full",
          onClick: () => {
            router.push(Dashboard.path);
          },
        }}
      />
    </main>
  );
}
