import { describe, it, expect } from "bun:test";
import handler from "../../../pages/api/votes";
import { createMocks } from "node-mocks-http";
import logData from "../../../newLogs";
import {
  createHiddenHandSummary,
  fetchVoteAndResetData,
  flattenUnique,
  groupEventsByVoter,
  groupEventsByVoterAndGauge,
  transformProcessedDataToGaugeVoteData,
  VoteAndResetRawData,
} from "@/pages/api/votes/data";
import fs from "fs";
import { mode } from "viem/chains";
import { createPublicClient, http } from "viem";
import { getGauges } from "@/pages/api/votes/app/getGauges";

// const data = logData as unknown as VoteAndResetRawData[][];

describe("/api/users API", () => {
  // it("returns 200 on GET", async () => {
  //   const { req, res } = createMocks({ method: "GET" });
  //   await handler(req, res);
  //
  //   expect(res._getStatusCode()).toBe(200);
  //   expect(res._getData()).toEqual(JSON.stringify({ message: "Get users" }));
  // });
  //
  // it("returns 200 on POST", async () => {
  //   const { req, res } = createMocks({ method: "POST" });
  //   await handler(req, res);
  //
  //   expect(res._getStatusCode()).toBe(200);
  //   expect(res._getData()).toEqual(JSON.stringify({ message: "Post users" }));
  // });
  //
  it("testing out data transformations", () => {
    // load the newLogs.json as JSON
    // expect(data.length).toEqual(4);
  });

  // test can filter out just the latest vote for a given token ID
  it("can filter out just the latest vote for a given token ID", async () => {
    // connect
    const client = createPublicClient({
      chain: mode,
      transport: http("https://mainnet.mode.network/"),
    });

    // Smart contract details
    const modeVoterAddress = "0x71439Ae82068E19ea90e4F506c74936aE170Cf58";

    const gauges = await getGauges(client, false, modeVoterAddress);
    const data = (await fetchVoteAndResetData(
      ["0x71439Ae82068E19ea90e4F506c74936aE170Cf58", "0x2aA8A5C1Af4EA11A1f1F10f3b73cfB30419F77Fb"],
      BigInt(1431)
    )) as unknown as VoteAndResetRawData[][];
    const flattened = flattenUnique(data);

    const output = createHiddenHandSummary(flattened, gauges);
    fs.writeFileSync(
      "api.json",
      JSON.stringify(
        output,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),

        2
      )
    );
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({ method: "PUT" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
