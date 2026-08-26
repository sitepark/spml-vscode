import { describe, expect, mock, test } from "bun:test";
import type { ExtensionContext } from "vscode";

// lspml.ts imports `workspace` at module scope, which only exists inside the
// extension host, so it has to be stubbed before the module is loaded.
mock.module("vscode", () => ({
	workspace: {
		getConfiguration: () => ({ get: () => undefined }),
	},
}));

const { convertArgsToArray, getLspmlPath } = await import("./lspml");

const ctx = {
	asAbsolutePath: (relative: string) => `/ext/${relative}`,
} as unknown as ExtensionContext;

/** Pretends the process runs on the given platform for one assertion. */
function onPlatform<T>(platform: string, arch: string, body: () => T): T {
	const original = { platform: process.platform, arch: process.arch };
	Object.defineProperty(process, "platform", {
		value: platform,
		configurable: true,
	});
	Object.defineProperty(process, "arch", { value: arch, configurable: true });
	try {
		return body();
	} finally {
		Object.defineProperty(process, "platform", {
			value: original.platform,
			configurable: true,
		});
		Object.defineProperty(process, "arch", {
			value: original.arch,
			configurable: true,
		});
	}
}

describe("convertArgsToArray", () => {
	test("turns every entry into a flag and its value", () => {
		expect(
			convertArgsToArray({
				"log-level": "DEBUG",
				"log-file": "/logs/lspml.log",
				"modules-file": "/storage/modules-file.json",
			}),
		).toEqual([
			"--log-level",
			"DEBUG",
			"--log-file",
			"/logs/lspml.log",
			"--modules-file",
			"/storage/modules-file.json",
		]);
	});

	test("returns nothing for an empty argument object", () => {
		expect(convertArgsToArray({})).toEqual([]);
	});

	test("skips fields that are not set", () => {
		// Every field of LspmlArgs is optional, so `--log-file undefined` has to
		// stay out of the command line.
		expect(
			convertArgsToArray({ "log-level": "INFO", "log-file": undefined }),
		).toEqual(["--log-level", "INFO"]);
	});
});

describe("getLspmlPath", () => {
	test.each([
		["win32", "x64", "/ext/resources/lspml-win-amd64.exe"],
		["linux", "x64", "/ext/resources/lspml-linux-amd64"],
		["darwin", "x64", "/ext/resources/lspml-macos-amd64"],
		["darwin", "arm64", "/ext/resources/lspml-macos-arm64"],
	])("resolves the binary for %s-%s", (platform, arch, expected) => {
		expect(onPlatform(platform, arch, () => getLspmlPath(ctx))).toBe(expected);
	});

	test.each([
		["linux", "arm64"],
		["win32", "arm64"],
		["freebsd", "x64"],
	])("throws for the unsupported %s-%s", (platform, arch) => {
		expect(() => onPlatform(platform, arch, () => getLspmlPath(ctx))).toThrow(
			`Unsupported architecture or platform ${platform}-${arch}`,
		);
	});
});
