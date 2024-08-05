import Image from "next/image";

export const BrandingSubline = () => {
  return (
    <div className="flex items-center gap-x-1.5 md:gap-x-2 lg:gap-x-2.5">
      <span className="text-xs leading-tight text-neutral-500 md:text-sm lg:text-base" style={{ fontSize: "0.9rem" }}>
        Governed on
      </span>
      <Image src="/logo-aragon.svg" height={16} width={64} className="md:hidden" alt="Aragon logo" />
      <Image src="/logo-aragon.svg" height={20} width={80} className="hidden md:block lg:hidden" alt="Aragon logo" />
      <Image src="/logo-aragon.svg" height={24} width={96} className="hidden lg:block" alt="Aragon logo" />
    </div>
  );
};
