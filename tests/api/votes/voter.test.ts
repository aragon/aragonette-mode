import { describe, it, expect } from "bun:test";
import handler from "@/pages/api/v1/votes/[voter]";
import { createMocks } from "node-mocks-http";
import { MODE_ESCROW_CONTRACT } from "@/constants";
import { GaugeVoteSummary } from "@/utils/api/types";
import { getVoter } from "@/utils/api/client";

describe("/api/votes/[voter] API", () => {
  it.only("gets the voting details for a single voter", async () => {
    const votingContract = await getVoter(MODE_ESCROW_CONTRACT);

    const query = {
      votingContract,
      voter: "0xa4B0dE8B6c6920885B9C7BdC84428a4884Aec2Ca",
      // epoch: "1433",
      // gauge: "0x982fEFb576A28C988637bdf37313dD69f6483254",
      fromBlock: "0",
    };
    const { req, res } = createMocks({ method: "GET", query });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    // const { data } = JSON.parse(res._getData());
    // console.log(data);
  });
});
