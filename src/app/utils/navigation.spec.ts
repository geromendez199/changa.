import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "./navigation";

describe("sanitizeRedirectPath", () => {
  it("allows valid internal redirects", () => {
    expect(sanitizeRedirectPath("/profile/edit")).toBe("/profile/edit");
    expect(sanitizeRedirectPath("/search?q=plomero")).toBe("/search?q=plomero");
  });

  it("falls back for external, malformed, or login loop redirects", () => {
    expect(sanitizeRedirectPath("https://malicious.example")).toBe("/home");
    expect(sanitizeRedirectPath("//malicious.example/path")).toBe("/home");
    expect(sanitizeRedirectPath("login")).toBe("/home");
    expect(sanitizeRedirectPath("/login?redirect=/profile")).toBe("/home");
    expect(sanitizeRedirectPath(undefined)).toBe("/home");
  });

  it("supports custom fallback", () => {
    expect(sanitizeRedirectPath(null, "/")).toBe("/");
  });
});
