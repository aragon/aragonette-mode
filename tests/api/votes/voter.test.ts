import { describe, it, expect } from "bun:test";
import handler from "@/pages/api/v1/voters/[voter]";
import { createMocks } from "node-mocks-http";
import { MODE_ESCROW_CONTRACT } from "@/constants";
import { getVotingContract } from "@/utils/api/client";

describe("/api/votes/[voter] API", async () => {
  const votingContract = await getVotingContract(MODE_ESCROW_CONTRACT);
  const voter = "0xa4B0dE8B6c6920885B9C7BdC84428a4884Aec2Ca";
  it.only("gets the voting details for a single voter", async () => {
    const query = {
      votingContract,
      voter,
      epoch: "1433",
      fromBlock: "0",
    };
    const { req, res } = createMocks({ method: "GET", query });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });

  it("returns 400 for invalid voter address", async () => {
    const query = {
      votingContract,
      epoch: "1433",
      gauge: "0x982fEFb576A28C988637bdf37313dD69f6483254",
      fromBlock: "0",
    } as any;

    const { req, res } = createMocks({ method: "GET", query });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");

    // too short
    query.voter = "0x";
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");

    // invalid address
    query.voter = voter;
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voter address");
  });

  it("returns 400 for invalid voting contract address", async () => {
    const query = {
      voter,
      epoch: "1433",
      fromBlock: "0",
    } as any;

    query.votingContract = "0x";
    const { req, res } = createMocks({ method: "GET", query });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voting contract address");

    query.votingContract = "0x982fEFb576A28C988637bdf37313dD69f648325j";
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid voting contract address");
  });

  it("returns 400 for invalid epoch", async () => {
    const query = {
      votingContract,
      voter,
      fromBlock: "0",
    } as any;

    const { req, res } = createMocks({ method: "GET", query });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid epoch");

    query.epoch = "latest";
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("returns 400 for invalid gauge address", async () => {
    const query = {
      votingContract,
      voter,
      epoch: "1433",
      fromBlock: "0",
      gauge: "0x",
    } as any;

    const { req, res } = createMocks({ method: "GET", query });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Invalid gauge address");
  });
  it("returns 405 for invalid method", async () => {});

  it("gets the voting details for a single voter with all epochs", async () => {});
  it("gets the voting details for a single voter with all epochs and a gauge", async () => {});
});
