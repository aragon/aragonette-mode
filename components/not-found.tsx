import { Button, Heading } from "@aragon/ods";
import router from "next/router";
import { Dashboard } from "./nav/routes";
import React from "react";

export const NotFound: React.FC<{ title?: string; message?: string }> = ({
  message = "We couldn't find the page that you're looking for.",
  title = "Page not found",
}) => {
  return (
    <main className="flex w-full flex-col items-center justify-center pt-60">
      <section className="absolute -top-[18px] -z-10 size-[180px] rounded-full bg-ellipse-37 blur-[120px] sm:right-[80px] sm:size-[340px]" />

      <div className="flex w-full flex-col items-center justify-center">
        <Heading size="h1">{title}</Heading>
        <p className="text-xl text-neutral-800">{message}</p>
        <Button className="mt-6 !rounded-full" variant="tertiary" onClick={() => router.push(Dashboard.path)}>
          Go to Dashboard
        </Button>
      </div>
    </main>
  );
};
