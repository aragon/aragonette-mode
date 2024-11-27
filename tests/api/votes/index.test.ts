import { describe, it, expect } from "bun:test";
import handler from "../../../pages/api/votes";
import { createMocks } from "node-mocks-http";

describe("/api/users API", () => {
  it("returns 200 on GET", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual(JSON.stringify({ message: "Get users" }));
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({ method: "PUT" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
