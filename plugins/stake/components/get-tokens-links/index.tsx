import { PUB_GET_MORE_BPT_URL, PUB_GET_MORE_MODE_URL, PUB_GET_MORE_BOTH_URL } from "@/constants";
import { Button, IconType } from "@aragon/ods";

const GetMoreTokens = () => {
  return (
    <div className="grid grid-cols-2 gap-4 py-3 lg:grid-cols-3">
      <Button
        href={PUB_GET_MORE_MODE_URL}
        target="_blank"
        variant="secondary"
        size="lg"
        responsiveSize={{ md: "md" }}
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get MODE
      </Button>
      <Button
        href={PUB_GET_MORE_BPT_URL}
        target="_blank"
        variant="secondary"
        size="lg"
        responsiveSize={{ md: "md" }}
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get BPT
      </Button>
      <Button
        href={PUB_GET_MORE_BOTH_URL}
        target="_blank"
        variant="secondary"
        size="lg"
        responsiveSize={{ md: "md" }}
        iconRight={IconType.LINK_EXTERNAL}
      >
        Get Both
      </Button>
    </div>
  );
};

export default GetMoreTokens;
