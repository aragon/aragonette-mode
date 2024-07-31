import { Dialog, type IDialogRootProps } from "@aragon/ods";
import Image from "next/image";
import { NavLink, type INavLink } from "./navLink";
import { BrandingSubline } from "../brandingSubline/brandingSubline";

interface IMobileNavDialogProps extends IDialogRootProps {
  navLinks: INavLink[];
}

export const MobileNavDialog: React.FC<IMobileNavDialogProps> = (props) => {
  const { navLinks, ...dialogRootProps } = props;

  return (
    <Dialog.Root {...dialogRootProps}>
      <Dialog.Content className="flex flex-col gap-y-6 px-3 py-7">
        <div className="flex flex-col gap-y-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Image src="/mode-logo.svg" width="32" height="32" className="shrink-0" alt="Polygon" />
              <BrandingSubline />
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="text-lg leading-tight text-neutral-800">Polygon Governance Hub</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-y-1">
          {navLinks.map((navLink) => (
            <NavLink key={navLink.id} {...navLink} onClick={() => dialogRootProps.onOpenChange?.(false)} />
          ))}
        </ul>
      </Dialog.Content>
    </Dialog.Root>
  );
};
