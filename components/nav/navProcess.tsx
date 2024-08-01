import { AvatarIcon, IconType } from "@aragon/ods";
import classNames from "classnames";
import Image from "next/image";
import { WalletContainer } from "../walletContainer/walletContainer";
import React from "react";
import { useRouter } from "next/navigation";

interface INavProcess {
  processName: string;
  exitPath: string;
}

export const NavProcess: React.FC<INavProcess> = (props) => {
  const { processName, exitPath } = props;

  const router = useRouter();

  return (
    <nav className="sticky top-0 z-[var(--hub-navbar-z-index)] w-full border-b border-b-neutral-100 bg-neutral-0 backdrop-blur-md">
      <div className="mx-auto flex gap-x-6 p-3 md:max-w-screen-xl md:px-6 lg:py-5">
        <div className="w-full">
          <div className="flex flex-1 gap-x-3">
            <button
              onClick={() => {
                router.push(exitPath);
              }}
              className={classNames(
                "rounded-full border border-neutral-100 bg-neutral-0 p-1",
                "outline-none focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset" // focus styles
              )}
            >
              <AvatarIcon size="lg" icon={IconType.CLOSE} />
            </button>
            <div className="flex flex-col gap-y-0.5">
              <span className="line-clamp-1 leading-tight text-neutral-800">{processName}</span>
              <div className="flex items-center gap-x-2">
                <span className="line-clamp-1 text-sm text-neutral-500">Mode Gov Hub</span>
                <Image
                  src="/mode-logo.svg"
                  width="24"
                  height="24"
                  className="shrink-0"
                  alt="Mode logo"
                  priority={true}
                />
              </div>
            </div>
          </div>
        </div>
        <WalletContainer />
      </div>
    </nav>
  );
};
