import { MainSection } from "@/components/layout/mainSection";
import { SectionView } from "@/components/layout/sectionView";
import { MemberProfile } from "@/components/nav/routes";
import { formatHexString } from "@/utils/evm";
import Link from "next/link";
import { zeroAddress } from "viem";

export default function Members() {
  const mockedMembers = [zeroAddress, "0xc1d60f584879f024299DA0F19Cdb47B931E35b53"];

  return (
    <MainSection>
      <SectionView>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl text-neutral-800">Members Page</h1>
          <div>
            {mockedMembers.map((address) => (
              <div key={address}>
                <Link href={MemberProfile.getPath(address)}>{formatHexString(address)}</Link>
              </div>
            ))}
          </div>
        </div>
      </SectionView>
    </MainSection>
  );
}
