import { NotFound } from "@/components/not-found";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();

  return <NotFound />;
}
