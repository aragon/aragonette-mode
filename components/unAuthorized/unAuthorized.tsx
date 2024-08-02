import { Button, Heading } from "@aragon/ods";
import { useRouter } from "next/router";
import { Dashboard } from "../nav/routes";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-center justify-center pt-60">
      <Heading size="h1">Unauthorized</Heading>
      <p className="text-xl text-neutral-800">You do not have access to this page.</p>
      <Button className="mt-6 !rounded-full" variant="tertiary" onClick={() => router.push(Dashboard.path)}>
        Go to Dashboard
      </Button>
    </div>
  );
}
