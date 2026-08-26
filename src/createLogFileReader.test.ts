import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { LogOutputChannel } from "vscode";
import { createLogFileReader } from "./createLogFileReader";

/** Records what the reader sends to which method of the output channel. */
function createChannelSpy() {
	const calls: string[] = [];
	const record =
		(level: string) =>
		(msg: string): void => {
			calls.push(`${level}: ${msg}`);
		};
	return {
		calls,
		channel: {
			trace: record("trace"),
			debug: record("debug"),
			info: record("info"),
			warn: record("warn"),
			error: record("error"),
		} as unknown as LogOutputChannel,
	};
}

const line = (level: string, message: string) =>
	`${JSON.stringify({ level, message, target: "lspml", timestamp: 1 })}\n`;

// Enough for the 20ms watch to fire and the read to complete.
const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

let dir: string;
let logFile: string;

beforeEach(() => {
	dir = fs.mkdtempSync(path.join(os.tmpdir(), "lspml-log-"));
	logFile = path.join(dir, "lspml.log");
});

afterEach(() => {
	fs.rmSync(dir, { recursive: true, force: true });
});

const read = (spy: ReturnType<typeof createChannelSpy>) =>
	createLogFileReader(logFile, spy.channel, { pollInterval: 20 });

describe("createLogFileReader", () => {
	test("does not throw when the log file does not exist yet", () => {
		const spy = createChannelSpy();
		// The server creates the file only once it writes its first log line,
		// so the reader has to tolerate its absence.
		const reader = read(spy);
		expect(spy.calls).toEqual([]);
		reader.dispose();
	});

	test("routes every level to the matching channel method", async () => {
		fs.writeFileSync(
			logFile,
			line("TRACE", "t") +
				line("DEBUG", "d") +
				line("INFO", "i") +
				line("WARN", "w") +
				line("ERROR", "e"),
		);
		const spy = createChannelSpy();
		const reader = read(spy);
		await settle();
		expect(spy.calls).toEqual([
			"trace: t",
			"debug: d",
			"info: i",
			"warn: w",
			"error: e",
		]);
		reader.dispose();
	});

	test("falls back to info for a level it does not know", async () => {
		fs.writeFileSync(logFile, line("FATAL", "unknown level"));
		const spy = createChannelSpy();
		const reader = read(spy);
		await settle();
		expect(spy.calls).toEqual(["info: unknown level"]);
		reader.dispose();
	});

	test("passes through output that is not json", async () => {
		fs.writeFileSync(logFile, "thread 'main' panicked at src/main.rs:1\n");
		const spy = createChannelSpy();
		const reader = read(spy);
		await settle();
		expect(spy.calls).toEqual([
			"info: thread 'main' panicked at src/main.rs:1",
		]);
		reader.dispose();
	});

	test("ignores blank lines", async () => {
		fs.writeFileSync(logFile, `\n\n${line("INFO", "only this")}\n`);
		const spy = createChannelSpy();
		const reader = read(spy);
		await settle();
		expect(spy.calls).toEqual(["info: only this"]);
		reader.dispose();
	});

	test("reassembles a line that is split across two writes", async () => {
		const spy = createChannelSpy();
		const reader = read(spy);
		const complete = line("WARN", "split across writes");
		const cut = Math.floor(complete.length / 2);

		fs.writeFileSync(logFile, complete.slice(0, cut));
		await settle();
		// Nothing may be reported for a line that is not terminated yet.
		expect(spy.calls).toEqual([]);

		fs.appendFileSync(logFile, complete.slice(cut));
		await settle();
		expect(spy.calls).toEqual(["warn: split across writes"]);
		reader.dispose();
	});

	test("reports appended lines exactly once", async () => {
		fs.writeFileSync(logFile, line("INFO", "first"));
		const spy = createChannelSpy();
		const reader = read(spy);
		await settle();
		expect(spy.calls).toEqual(["info: first"]);

		fs.appendFileSync(logFile, line("INFO", "second"));
		await settle();
		// "first" must not show up again on the second read.
		expect(spy.calls).toEqual(["info: first", "info: second"]);
		reader.dispose();
	});

	test("keeps up with lines written while a read is in flight", async () => {
		const spy = createChannelSpy();
		const reader = read(spy);
		for (let i = 0; i < 50; i++) {
			fs.appendFileSync(logFile, line("INFO", `line ${i}`));
		}
		await settle();
		await settle();
		expect(spy.calls).toHaveLength(50);
		expect(spy.calls[0]).toBe("info: line 0");
		expect(spy.calls[49]).toBe("info: line 49");
		reader.dispose();
	});

	test("stops reporting after dispose", async () => {
		fs.writeFileSync(logFile, line("INFO", "before dispose"));
		const spy = createChannelSpy();
		const reader = read(spy);
		await settle();
		reader.dispose();

		fs.appendFileSync(logFile, line("INFO", "after dispose"));
		await settle();
		expect(spy.calls).toEqual(["info: before dispose"]);
	});
});
