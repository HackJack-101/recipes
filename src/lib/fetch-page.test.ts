import { describe, expect, it } from "vitest";
import { isPrivateIp } from "./fetch-page";

describe("isPrivateIp", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0"])(
    "blocks %s",
    (ip) => expect(isPrivateIp(ip)).toBe(true),
  );

  it.each(["::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])("blocks %s", (ip) => expect(isPrivateIp(ip)).toBe(true));

  it.each(["8.8.8.8", "172.32.0.1", "2606:4700::1111"])("allows %s", (ip) => expect(isPrivateIp(ip)).toBe(false));
});
