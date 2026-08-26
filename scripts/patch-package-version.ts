import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
	new URL("../package.json", import.meta.url),
);

export const BUMPS = ["major", "minor", "patch"] as const;
export type Bump = (typeof BUMPS)[number];

export const isBump = (value: string): value is Bump =>
	(BUMPS as readonly string[]).includes(value);

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
export const generateNightlyVersion = (now = new Date()) => {
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth() + 1;
	const day = now.getUTCDate();
	const hour = String(now.getUTCHours()).padStart(2, "0");
	const minute = String(now.getUTCMinutes()).padStart(2, "0");

	return `${year}.${month}.${day}${hour}${minute}`;
};

/**
 * Raises the given part of a `major.minor.patch` version
 *
 * Everything to the right of the raised part is reset, so bumping the minor of
 * `1.2.3` yields `1.3.0`.
 */
export const bumpVersion = (version: string, bump: Bump): string => {
	const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
	if (!match) {
		throw new Error(
			`Cannot bump "${version}", expected a major.minor.patch version`,
		);
	}
	const [major, minor, patch] = match.slice(1).map(Number);

	switch (bump) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
	}
};

/**
 * Patches the package.json file with a new version
 *
 * Without an argument a nightly version is generated. Given one of `major`,
 * `minor` or `patch`, the current version is raised accordingly.
 */
const patchPackageJson = (bump?: string) => {
	// Read and parse instead of `import`ing: the namespace object of a json
	// import carries a `default` key holding another copy of the manifest,
	// which would end up in the patched file.
	const json = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

	let version: string;
	if (bump === undefined) {
		version = generateNightlyVersion();
	} else if (isBump(bump)) {
		version = bumpVersion(json.version, bump);
	} else {
		throw new Error(
			`Unknown version bump "${bump}", expected one of ${BUMPS.join(", ")}`,
		);
	}

	writeFileSync(
		packageJsonPath,
		`${JSON.stringify({ ...json, version }, null, "\t")}\n`,
	);

	console.log(`Patched package.json with version: ${version}`);
	return version;
};

if (import.meta.main) {
	patchPackageJson(process.argv[2]);
}
