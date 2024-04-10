import { type ReactNode } from "react";

export function MainSection({ children }: { children: ReactNode }) {
  return <main className="flex w-screen max-w-full flex-col items-center pt-6">{children}</main>;
}
