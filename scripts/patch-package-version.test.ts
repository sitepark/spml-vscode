import { describe, expect, test } from "bun:test";
import {
	bumpVersion,
	generateNightlyVersion,
	isBump,
} from "./patch-package-version";

describe("bumpVersion", () => {
	test.each([
		["0.8.0", "major", "1.0.0"],
		["0.8.0", "minor", "0.9.0"],
		["0.8.0", "patch", "0.8.1"],
		["1.2.3", "major", "2.0.0"],
		["1.2.3", "minor", "1.3.0"],
		["1.2.3", "patch", "1.2.4"],
		// Everything right of the raised part is reset.
		["0.9.7", "minor", "0.10.0"],
		["9.9.9", "major", "10.0.0"],
	] as const)("bumps %s by %s to %s", (version, bump, expected) => {
		expect(bumpVersion(version, bump)).toBe(expected);
	});

	test.each(["0.8", "1.2.3.4", "v1.2.3", "1.2.x", "", "2026.8.260932-1"])(
		"rejects %p",
		(version) => {
			expect(() => bumpVersion(version, "patch")).toThrow("Cannot bump");
		},
	);

	test("accepts a nightly version, which is a plain three part version", () => {
		expect(bumpVersion(generateNightlyVersion(), "patch")).toMatch(
			/^\d+\.\d+\.\d+$/,
		);
	});
});

describe("isBump", () => {
	test.each(["major", "minor", "patch"])("accepts %p", (value) => {
		expect(isBump(value)).toBe(true);
	});

	test.each(["Major", "prerelease", "", "0.9.0"])("rejects %p", (value) => {
		expect(isBump(value)).toBe(false);
	});
});

describe("generateNightlyVersion", () => {
	test("is built from the utc date and time", () => {
		expect(generateNightlyVersion(new Date("2024-02-17T23:04:00Z"))).toBe(
			"2024.2.172304",
		);
	});

	test("uses utc rather than the local timezone", () => {
		// 00:30 UTC on the 18th, which is still the 17th in some timezones.
		expect(generateNightlyVersion(new Date("2024-02-18T00:30:00Z"))).toBe(
			"2024.2.180030",
		);
	});

	test.each([
		new Date("2024-01-01T00:00:00Z"),
		new Date("2024-02-09T23:59:00Z"),
		new Date("2024-12-31T23:59:00Z"),
	])("produces a version without leading zeroes for %s", (now) => {
		const version = generateNightlyVersion(now);
		// semver rejects numeric identifiers with a leading zero, so neither the
		// minor nor the patch part may be padded.
		expect(version).toMatch(/^\d+\.[1-9]\d*\.[1-9]\d*$/);
	});

	test("keeps increasing over the course of a month", () => {
		const at = (iso: string) =>
			Number(generateNightlyVersion(new Date(iso)).split(".")[2]);
		expect(at("2024-03-09T23:59:00Z")).toBeLessThan(at("2024-03-10T00:00:00Z"));
		expect(at("2024-03-01T00:00:00Z")).toBeLessThan(at("2024-03-02T00:00:00Z"));
	});
});
