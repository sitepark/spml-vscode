import * as fs from "node:fs";
import type { LogOutputChannel } from "vscode";
import type { LogLine } from "./lspml";

export function createLogFileReader(
	logFilePath: string,
	outputChannel: LogOutputChannel,
) {
	let lastReadPosition = 0;
	// Bytes of a trailing line that was not terminated yet, because the server
	// is still writing it.
	let pendingLine = "";
	let reading = false;
	let readAgain = false;

	const logMapping: Record<string, ((msg: string) => void) | undefined> = {
		TRACE: (msg) => outputChannel.trace(msg),
		DEBUG: (msg) => outputChannel.debug(msg),
		INFO: (msg) => outputChannel.info(msg),
		WARN: (msg) => outputChannel.warn(msg),
		ERROR: (msg) => outputChannel.error(msg),
	};

	function displayLine(line: string) {
		if (line.trim().length === 0) {
			return;
		}
		let logLine: LogLine;
		try {
			logLine = JSON.parse(line) as LogLine;
		} catch {
			// Not every line the server writes is necessarily json (panics, for
			// example, are not), so pass it through instead of dropping it.
			outputChannel.info(line);
			return;
		}
		const log =
			logMapping[logLine.level] ?? ((msg: string) => outputChannel.info(msg));
		log(logLine.message ?? line);
	}

	function displayNewLogFileContent() {
		if (reading) {
			// Only ever read once more, no matter how often the file changed
			// while we were reading it.
			readAgain = true;
			return;
		}
		reading = true;

		const fileStream = fs.createReadStream(logFilePath, {
			start: lastReadPosition,
			encoding: "utf-8",
		});
		let settled = false;
		const finish = () => {
			if (settled) {
				return;
			}
			settled = true;
			// Advance by what was actually consumed - the file may have grown
			// while it was read and `stat`ing it here would skip those bytes.
			lastReadPosition += fileStream.bytesRead;
			reading = false;
			if (readAgain) {
				readAgain = false;
				displayNewLogFileContent();
			}
		};

		fileStream.on("data", (chunk) => {
			const lines = (pendingLine + chunk).split(/\r?\n/);
			pendingLine = lines.pop() ?? "";
			for (const line of lines) {
				displayLine(line);
			}
		});
		fileStream.on("error", (error: NodeJS.ErrnoException) => {
			// The file does not exist until the server writes its first log
			// line, and is removed again on deactivation.
			if (error.code !== "ENOENT") {
				outputChannel.warn(`Cannot read ${logFilePath}: ${error.message}`);
			}
			finish();
		});
		fileStream.on("close", finish);
	}

	displayNewLogFileContent();
	// Watch for changes in the log file
	fs.watchFile(logFilePath, (curr, prev) => {
		// Check if the modification time changed
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			displayNewLogFileContent(); // If changed, update the output channel
		}
	});

	return {
		dispose: () => {
			fs.unwatchFile(logFilePath);
		},
	};
}
