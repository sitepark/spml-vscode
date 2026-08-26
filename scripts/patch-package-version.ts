import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
	new URL("../package.json", import.meta.url),
);

/**
 * Generates a nightly version identifier
 *
 * This helper function generates a nightly version identifier based on the
 * current UTC date and time that looks like this:
 * `{year}.{month}.{day}{hour}{min}`.
 *
 * For example, if the current date is 2024-02-17 and the current time is 23:00,
 * the generated version would be `2024.2.172300`.
 *
 * Month and day are deliberately not zero padded: semver rejects numeric
 * identifiers with a leading zero, so `2024.02.17...` would not be a valid
 * version. Hour and minute are padded to keep the patch version increasing.
 */
const generateNightlyVersion = () => {
	const now = new Date();

	const year = now.getUTCFullYear();
	const month = now.getUTCMonth() + 1;
	const day = now.getUTCDate();
	const hour = String(now.getUTCHours()).padStart(2, "0");
	const minute = String(now.getUTCMinutes()).padStart(2, "0");

	return `${year}.${month}.${day}${hour}${minute}`;
};

/**
 * Patches the package.json file with a nightly version
 */
const patchPackageJson = () => {
	// Read and parse instead of `import`ing: the namespace object of a json
	// import carries a `default` key holding another copy of the manifest,
	// which would end up in the patched file.
	const json = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

	const nightlyVersion = generateNightlyVersion();

	writeFileSync(
		packageJsonPath,
		`${JSON.stringify({ ...json, version: nightlyVersion }, null, "\t")}\n`,
	);

	console.log(`Patched package.json with nightly version: ${nightlyVersion}`);
};

patchPackageJson();
