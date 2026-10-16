import { describe, expect, it } from "vitest";
import { htmlToText } from "./importer";

describe("htmlToText", () => {
  it("keeps recipe JSON-LD and visible text, drops scripts and navigation", () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@type":"Recipe","name":"Soupe"}</script>
      <script type="application/ld+json">{"@type":"Organization"}</script>
      </head><body><nav>Menu</nav><h1>Soupe</h1><script>track()</script><p>Faire chauffer.</p></body></html>`;
    const text = htmlToText(html);
    expect(text).toContain('{"@type":"Recipe","name":"Soupe"}');
    expect(text).not.toContain("Organization");
    expect(text).toContain("Faire chauffer.");
    expect(text).not.toContain("Menu");
    expect(text).not.toContain("track()");
  });

  it("works without structured data", () => {
    expect(htmlToText("<body><p>Hello</p></body>")).toBe("Page text:\nHello");
  });
});
