export type TargetBrowser = "safari";

export const browser: TargetBrowser = "safari";

export function getOutDir() {
  return `dist/${browser}`;
}

export function getManifestSrc() {
  return "manifest/safari.json";
}
