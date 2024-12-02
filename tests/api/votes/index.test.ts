import { describe, it, expect } from "bun:test";
import handler from "@/pages/api/v1/votes/gaugeVotes";
import { createMocks } from "node-mocks-http";
import { HiddenHandSummary } from "@/pages/api/votes/data";

describe.only("/api/votes/gaugeVotes API", () => {
  it("returns the list of gauges", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const getData = JSON.parse(res._getData());
    const summary: HiddenHandSummary[] = JSON.parse(getData.data);
    expect(summary.length).toBeGreaterThan(0);

    const item = summary[0];
    const { votes, totalVotes } = item;
    expect(item.gauge.length).toEqual(42); // eth address
    // voter inside votes should be unique
    const voters = votes.map((s) => s.voter);
    expect(new Set(voters).size).toEqual(voters.length);

    // votes should roughly match the total
    const aggregated = votes.reduce((acc, s) => acc + BigInt(s.votes), 0n);
    expect(aggregated).toBeGreaterThan(0n);

    expect(BigInt(totalVotes)).toEqual(aggregated);
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({ method: "PUT" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
