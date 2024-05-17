import * as fs from "node:fs";
import * as readline from "node:readline";
import type { LogOutputChannel } from "vscode";
import type { LogLine, LspmlLogLevel } from "./lspml";

export function createLogFileReader(
	logFilePath: string,
	outputChannel: LogOutputChannel,
) {
	let lastReadPosition = 0;

	const logMapping: Record<LspmlLogLevel, (msg: string) => void> = {
		DEBUG: outputChannel.debug,
		INFO: outputChannel.info,
		TRACE: outputChannel.trace,
		WARN: outputChannel.warn,
	};

	function displayNewLogFileContent() {
		const fileStream = fs.createReadStream(logFilePath, {
			start: lastReadPosition,
		});
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Number.POSITIVE_INFINITY,
		});

		rl.on("line", (line) => {
			const logLine = JSON.parse(line) as LogLine;
			logMapping[logLine.level](logLine.message);
		});

		rl.on("close", () => {
			lastReadPosition = fs.statSync(logFilePath).size;
		});
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
