import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("popup document defines an intrinsic Safari toolbar size", async () => {
  const popupHtml = await readFile("popup.html", "utf8");

  assert.match(popupHtml, /\*\s+\{[\s\S]*box-sizing: border-box;[\s\S]*\}/);
  assert.match(
    popupHtml,
    /html,\s+body,\s+#root\s+\{[\s\S]*margin: 0;[\s\S]*width: 380px;[\s\S]*min-width: 380px;[\s\S]*height: 420px;[\s\S]*min-height: 420px;[\s\S]*overflow: hidden;[\s\S]*\}/,
  );
  assert.match(
    popupHtml,
    /@media \(hover: none\)\s+\{[\s\S]*html,\s+body\s+\{[\s\S]*width: 100%;[\s\S]*min-width: 0;[\s\S]*max-width: none;[\s\S]*height: 100%;[\s\S]*min-height: 0;[\s\S]*max-height: 100vh;[\s\S]*max-height: 100dvh;[\s\S]*background: #ffffff;[\s\S]*color: #111111;[\s\S]*color-scheme: light;[\s\S]*\}[\s\S]*#root\s+\{[\s\S]*--crw-popup-shell-background: #004080;[\s\S]*width: 100%;[\s\S]*min-width: 0;[\s\S]*max-width: none;[\s\S]*height: 100%;[\s\S]*min-height: 0;[\s\S]*max-height: 100vh;[\s\S]*max-height: 100dvh;[\s\S]*background: #ffffff;[\s\S]*color: #ffffff;[\s\S]*color-scheme: light;[\s\S]*\}[\s\S]*\}/,
  );
});
