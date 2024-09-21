import { PUB_GET_MORE_BPT_URL, PUB_GET_MORE_MODE_URL } from "@/constants";
import { Button, IconType } from "@aragon/ods";
import React from "react";

export const StakeUserStats: React.FC = () => {
  return (
    <aside className="flex w-full flex-col gap-y-4 justify-self-center md:max-w-[370px] md:gap-y-6">
      <dl className="divide-y divide-neutral-100">
        <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
          <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6">
            Your active voting power
          </dt>
        </div>

        <div className="grid grid-cols-2 gap-y-3 py-3">
          <div>MODE</div>
          <div>1234</div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 py-3">
          <div>BPT</div>
          <div>5555</div>
        </div>
        <div className="grid grid-cols-2 gap-y-3 py-3">
          <div>Total</div>
          <div>6789</div>
        </div>
      </dl>
      <div className="grid grid-cols-2 gap-3 py-3">
        <Button href={PUB_GET_MORE_MODE_URL} variant="secondary" size="md" iconRight={IconType.LINK_EXTERNAL}>
          Get more MODE
        </Button>
        <Button href={PUB_GET_MORE_BPT_URL} variant="secondary" size="md" iconRight={IconType.LINK_EXTERNAL}>
          Get more BPT
        </Button>
      </div>
    </aside>
  );
};
