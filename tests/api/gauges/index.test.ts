import { describe, it, expect } from "bun:test";
import handler from "../../../pages/api/gauges";
import { createMocks } from "node-mocks-http";

describe("/api/gauges API", () => {
  it("returns the list of gauges", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const { data } = JSON.parse(res._getData());
    expect(data.length).toBeGreaterThan(0);
    const item = data[0];
    expect(item.address.length).toEqual(42); // eth address
    expect(item.ipfsURI.length).toBeGreaterThan(7); // ipfs://
    expect(item.metadata).toBeDefined();
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({ method: "PUT" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
