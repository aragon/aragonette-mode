import { Button, Icon, IconType } from "@aragon/ods";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import { Else, If, Then } from "./if";

const Sidebar = () => {
  const { pathname } = useRouter();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);

  const SidebarSwitchButton = () => (
    <Button
      size="sm"
      responsiveSize={{}}
      variant="tertiary"
      className="md:hidden block absolute mt-2 ml-2 z-50"
      onClick={() => setIsOpen(!isOpen)}
    >
      <If condition={isOpen}>
        <Then>
          <CloseIcon className="h-6 w-6 fill-current" />
        </Then>
        <Else>
          <MenuIcon className="h-6 w-6 fill-current" />
        </Else>
      </If>
    </Button>
  );

  return (
    <header className="h-screen select-none">
      <SidebarSwitchButton />

      <div
        className={
          "flex flex-col justify-between h-screen md:w-72 bg-neutral-50 md:bg-neutral-100 " +
          (isOpen
            ? "max-sm:absolute md:relative max-sm:w-full"
            : "max-sm:hidden")
        }
      >
        <div className="w-full">
          <div className="w-full flex items-center pt-14 py-3 px-3 md:pt-6">
            <Image
              src="/logo-bw-lg.png"
              width="60"
              height="60"
              className="w-8 my-1 mx-4"
              alt="Aragonette"
            />
            <Link
              href="/"
              className={`block py-1 leading-tight font-semibold text-xl text-neutral-700`}
              aria-current="page"
            >
              Aragonette
            </Link>
          </div>
          <MenuList isHome={isHome} setIsOpen={setIsOpen} />
        </div>
        <div className="w-full">
          <PoweredByAragon />
        </div>
      </div>
    </header>
  );
};

const MenuList = ({
  isHome,
  setIsOpen,
}: {
  isHome: boolean;
  setIsOpen: (o: boolean) => any;
}) => {
  return (
    <ul className="mt-6 px-6">
      {/* HOME */}
      <li
        onClick={() => setIsOpen(false)}
        className={`flex w-full justify-between text-neutral-700 cursor-pointer items-center mb-2 ${
          isHome
            ? "bg-neutral-100 md:bg-neutral-200 font-semibold text-primary-500"
            : ""
        } rounded-lg shadow-lg hover:bg-neutral-100 md:hover:bg-neutral-200`}
      >
        <Link href="/" className="flex items-center w-full p-3">
          <Icon
            className="mr-2"
            icon={IconType.HOME}
            size="lg"
            responsiveSize={{ md: "lg" }}
          />

          <span
            className={`block py-2 pr-4 pl-3 rounded ${
              isHome ? "font-semibold" : ""
            } lg:p-0`}
            aria-current="page"
          >
            Home
          </span>
        </Link>
      </li>
    </ul>
  );
};

const PoweredByAragon = () => {
  return (
    <div className="w-full flex justify-center mb-3">
      <Link
        href="https://aragon.org"
        className="flex items-center focus:outline-none focus:ring-2 focus:ring-white"
      >
        <span className="block py-2 pr-4 pl-3 lg:border-0 flex flex-row">
          Powered by{" "}
          <span className="font-semibold text-primary-400 mr-1">
            &nbsp;Aragon
          </span>
          <Image
            src="/logo.png"
            width="24"
            height="20"
            className=""
            alt="Aragonette"
          />
        </span>
      </Link>
    </div>
  );
};

export default Sidebar;
