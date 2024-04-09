import { formatHexString } from "@/utils/evm";
import { Link as StyledLink } from "@aragon/ods";
import Link from "next/link";
import { zeroAddress } from "viem";

export default function Members() {
  const mockedMembers = [zeroAddress, "0xc1d60f584879f024299DA0F19Cdb47B931E35b53"];

  return (
    <div>
      Members Page
      <div>
        {mockedMembers.map((address) => (
          <div key={address}>
            <Link href={`/members/${address}`}>
              <StyledLink>{formatHexString(address)}</StyledLink>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
