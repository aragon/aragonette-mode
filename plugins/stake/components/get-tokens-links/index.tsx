import { PUB_GET_MORE_BPT_URL, PUB_GET_MORE_MODE_URL, PUB_GET_MORE_BOTH_URL } from "@/constants";
import { Button, IconType } from "@aragon/ods";
import { DevMintTokens } from "../dev-tools";

const GetMoreTokens = () => {
  return (
    <div className="grid grid-cols-3 gap-3 py-3">
      <Button
        href={PUB_GET_MORE_MODE_URL}
        target="_blank"
        variant="secondary"
        size="md"
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get MODE
      </Button>
      <Button
        href={PUB_GET_MORE_BPT_URL}
        target="_blank"
        variant="secondary"
        size="md"
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get BPT
      </Button>
      <Button
        href={PUB_GET_MORE_BOTH_URL}
        target="_blank"
        variant="secondary"
        size="md"
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get Both
      </Button>

      {/* TODO: Remove when ready to ship */}
      {process.env.NODE_ENV === "development" && <DevMintTokens />}
    </div>
  );
};

export default GetMoreTokens;
