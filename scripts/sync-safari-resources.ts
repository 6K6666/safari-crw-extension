import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const sourceDir = resolve("dist/safari");
const targetDir = resolve(
  "safari/Consumer Rights Wiki/Shared (Extension)/Resources",
);

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });

console.log(`Synced Safari extension resources to ${targetDir}`);
