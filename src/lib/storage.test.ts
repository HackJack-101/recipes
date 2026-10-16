import { describe, expect, it } from "vitest";
import { sniffImage } from "./storage";

const pad = (bytes: number[]) => Buffer.from([...bytes, ...Array(12).fill(0)]);

describe("sniffImage", () => {
  it("detects supported formats from magic bytes", () => {
    expect(sniffImage(pad([0xff, 0xd8, 0xff]))?.mime).toBe("image/jpeg");
    expect(sniffImage(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe("image/png");
    expect(sniffImage(Buffer.from("RIFF\0\0\0\0WEBPVP8 "))?.mime).toBe("image/webp");
    expect(sniffImage(Buffer.from("GIF89a\0\0\0\0\0\0"))?.mime).toBe("image/gif");
  });

  it("rejects anything else", () => {
    expect(sniffImage(Buffer.from("<svg></svg>  "))).toBeNull();
    expect(sniffImage(Buffer.from([0xff, 0xd8]))).toBeNull();
  });
});
