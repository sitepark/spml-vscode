import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ExtensionContext, Uri } from "vscode";

const created: string[] = [];

// storage.ts only needs `workspace.fs.createDirectory`, but the stub also
// carries `getConfiguration` so that it stays usable for any other module that
// is loaded into the same test process.
mock.module("vscode", () => ({
	workspace: {
		getConfiguration: () => ({ get: () => undefined }),
		fs: {
			createDirectory: async (uri: Uri) => {
				created.push(uri.fsPath);
			},
		},
	},
}));

const { getLogDir, getStorageDir } = await import("./storage");

const uri = (fsPath: string) => ({ fsPath }) as Uri;

beforeEach(() => {
	created.length = 0;
});

describe("getLogDir", () => {
	test("creates the log directory and returns its path", async () => {
		const ctx = { logUri: uri("/logs/spml") } as unknown as ExtensionContext;
		expect(await getLogDir(ctx)).toBe("/logs/spml");
		expect(created).toEqual(["/logs/spml"]);
	});
});

describe("getStorageDir", () => {
	test("creates the storage directory and returns its path", async () => {
		const ctx = {
			storageUri: uri("/storage/spml"),
		} as unknown as ExtensionContext;
		expect(await getStorageDir(ctx)).toBe("/storage/spml");
		expect(created).toEqual(["/storage/spml"]);
	});

	test("returns undefined when no workspace is open", async () => {
		// `storageUri` is undefined without a workspace, and nothing may be
		// created in that case - the module mapping is simply not written.
		const ctx = { storageUri: undefined } as unknown as ExtensionContext;
		expect(await getStorageDir(ctx)).toBeUndefined();
		expect(created).toEqual([]);
	});
});
