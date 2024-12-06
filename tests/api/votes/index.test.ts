import { describe, it, expect } from "bun:test";
import handler from "@/pages/api/v1/votes/gaugeVotes";
import { createMocks } from "node-mocks-http";
import { MODE_ESCROW_CONTRACT } from "@/constants";
import { GaugeVoteSummary } from "@/utils/api/types";
import { getVoter } from "@/utils/api/client";

describe("/api/votes/gaugeVotes API", () => {
  it("returns the list of gauges", async () => {
    const voter = await getVoter(MODE_ESCROW_CONTRACT);

    const { req, res } = createMocks({ method: "GET", query: { voter, epoch: "1430" } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const { data } = JSON.parse(res._getData());

    const summary: GaugeVoteSummary[] = data;
    expect(summary.length).toBeGreaterThan(1);
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

  it("returns votes for a single gauge", async () => {
    const voter = await getVoter(MODE_ESCROW_CONTRACT);
    const gaugeKimExchange = "0x982fEFb576A28C988637bdf37313dD69f6483254";
    const { req, res } = createMocks({ method: "GET", query: { voter, epoch: "1430", gauge: gaugeKimExchange } });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const { data } = JSON.parse(res._getData());
    const summary: GaugeVoteSummary[] = data;
    expect(summary.length).toBe(1);
    const item = summary[0];
    expect(item.title).toEqual("Kim Exchange");
    expect(item.gauge).toEqual(gaugeKimExchange);
  });

  it("returns 400 for invalid voter address", async () => {
    // missing
    const { req, res } = createMocks({ method: "GET", query: { epoch: "1" } });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");

    // too short
    req.query.voter = "0x";

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");

    // too long
    req.query.voter = "0x" + "0".repeat(43);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");

    // invalid prefix
    req.query.voter = "1x" + "0".repeat(40);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");
  });

  it("returns 400 for invalid epoch", async () => {
    const { req, res } = createMocks({ method: "GET", query: { voter: MODE_ESCROW_CONTRACT, epoch: "a" } });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid epoch");
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({ method: "PUT" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
