import { PUB_DAO_ADDRESS } from "@/constants";
import { formatHexString } from "@/utils/evm";
import { Button, Dialog, IconType, clipboardUtils, type IDialogRootProps } from "@aragon/ods";
import Image from "next/image";
import { NavLink, type INavLink } from "./navLink";
import { BrandingSubline } from "../brandingSubline/brandingSubline";

interface IMobileNavDialogProps extends IDialogRootProps {
  navLinks: INavLink[];
}

export const MobileNavDialog: React.FC<IMobileNavDialogProps> = (props) => {
  const { navLinks, ...dialogRootProps } = props;

  const handleCopyAddress = async () => {
    await clipboardUtils.copy(PUB_DAO_ADDRESS);
  };

  return (
    <Dialog.Root {...dialogRootProps}>
      <Dialog.Content className="flex flex-col gap-y-6 px-3 py-7">
        <div className="flex flex-col gap-y-3 px-4">
          <div className="flex items-center justify-between">
            <Image src="/logo-polygon-icon.svg" width="32" height="32" className="shrink-0" alt="Polygon" />
            <Button
              iconLeft={IconType.COPY}
              size="sm"
              variant="tertiary"
              className="shrink-0 rounded-[100%]"
              onClick={handleCopyAddress}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="text-lg leading-tight text-neutral-800">Polygon Governance Hub</span>
            <span className="text-sm leading-tight text-neutral-500">{formatHexString(PUB_DAO_ADDRESS)}</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-y-1">
          {navLinks.map((navLink) => (
            <NavLink key={navLink.id} {...navLink} onClick={() => dialogRootProps.onOpenChange?.(false)} />
          ))}
        </ul>
        <BrandingSubline />
      </Dialog.Content>
    </Dialog.Root>
  );
};
