import { Button, IconType } from "@aragon/ods";
import classNames from "classnames";
import React from "react";

interface ILayer3BannerProps {
  show: boolean;
}

export const Layer3Banner: React.FC<ILayer3BannerProps> = ({ show }) => {
  return (
    show && (
      <div
        className={classNames(
          "bg-gradient bg-gradient-to-r from-primary-500 from-15% via-primary-500/80 via-50% to-primary-500/90 to-90% py-2"
        )}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-x-6 gap-y-2 px-4 md:flex-row md:items-center md:justify-center md:px-6">
          <p className="text-sm font-semibold text-neutral-0 md:text-base">
            Embark on Quests, Unlock Knowledge: Explore Polygon & Web3 — reaping rewards ✨ as you go!
          </p>
          <span className="flex">
            <Button
              className="!rounded-full"
              variant="secondary"
              size="sm"
              href="https://app.layer3.xyz/communities/polygon-labs?slug=polygon-labs"
              iconRight={IconType.LINK_EXTERNAL}
              target="_blank"
              rel="noopener"
            >
              Start now
            </Button>
          </span>
        </div>
      </div>
    )
  );
};
