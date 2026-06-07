import fs from "node:fs";

const releaseVersion = process.env.RELEASE_VERSION;

if (!releaseVersion) {
  console.error("RELEASE_VERSION is required");
  process.exit(1);
}

const updateJsonVersion = (filePath: string) => {
  const value = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;

  value.version = releaseVersion;

  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

console.log(`Using release version: ${releaseVersion}`);
updateJsonVersion("package.json");
updateJsonVersion("manifest/safari.json");
