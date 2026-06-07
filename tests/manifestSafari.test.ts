import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

type ExtensionManifest = {
  manifest_version?: number;
  action?: {
    default_popup?: string;
    default_title?: string;
  };
  options_page?: string;
  permissions?: string[];
  host_permissions?: string[];
  background?: {
    service_worker?: string;
  };
  content_scripts?: Array<{
    matches?: string[];
    js?: string[];
    run_at?: string;
  }>;
  web_accessible_resources?: Array<{
    resources?: string[];
    matches?: string[];
  }>;
};

const readSafariManifest = async (): Promise<ExtensionManifest> => {
  const raw = await readFile("manifest/safari.json", "utf8");
  return JSON.parse(raw) as ExtensionManifest;
};

test("Safari manifest keeps the expected MV3 extension shape", async () => {
  const manifest = await readSafariManifest();

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.action?.default_title, "CRW Extension");
  assert.equal(manifest.action?.default_popup, "popup.html");
  assert.equal(manifest.options_page, "options.html");
  assert.deepEqual(manifest.permissions, ["tabs", "storage"]);
  assert.deepEqual(manifest.host_permissions, ["<all_urls>"]);
  assert.equal(manifest.background?.service_worker, "background.js");
});

test("Safari manifest exposes the required content script and assets", async () => {
  const manifest = await readSafariManifest();
  const contentScript = manifest.content_scripts?.[0];
  const webAccessibleResources = manifest.web_accessible_resources?.[0];

  assert.deepEqual(contentScript?.matches, ["<all_urls>"]);
  assert.deepEqual(contentScript?.js, ["assets/content.js"]);
  assert.equal(contentScript?.run_at, "document_idle");
  assert.deepEqual(webAccessibleResources?.matches, ["<all_urls>"]);

  for (const asset of [
    "crw_logo.png",
    "open-in-new.svg",
    "settings.svg",
    "close.svg",
  ]) {
    assert.ok(
      webAccessibleResources?.resources?.includes(asset),
      `Missing Safari web-accessible asset: ${asset}`,
    );
  }
});
