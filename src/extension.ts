import * as fs from "node:fs";
import { commands, type ExtensionContext, window, workspace } from "vscode";
import type { LanguageClient } from "vscode-languageclient/node";
import { createLogFileReader } from "./createLogFileReader";
import { createLanguageClient, prepareLogFile } from "./lspml";

let client: LanguageClient | undefined;

export async function activate(ctx: ExtensionContext) {
	const outputChannel = window.createOutputChannel("SPML", "spml");
	const restart = async () => {
		outputChannel.appendLine("RESTART");
		// Stop the server before disposing anything: a still running server
		// would keep writing to the log file the new one is about to use.
		await deactivate();
		// `splice` so that the next restart does not dispose these again.
		for (const sub of ctx.subscriptions.splice(0)) {
			try {
				sub.dispose();
			} catch (e) {
				console.error(e);
			}
		}
		await activate(ctx);
	};

	const logChannel = window.createOutputChannel("LSPML", {
		log: true,
	});

	const logFile = await prepareLogFile(ctx);
	client = await createLanguageClient(ctx, logFile);

	ctx.subscriptions.push(client);
	ctx.subscriptions.push(outputChannel, logChannel);
	ctx.subscriptions.push(createLogFileReader(logFile, logChannel));
	ctx.subscriptions.push({
		dispose: () => {
			if (fs.existsSync(logFile)) {
				fs.unlinkSync(logFile);
			}
		},
	});
	ctx.subscriptions.push(
		commands.registerCommand("spml.restart", () => restart()),
	);
	ctx.subscriptions.push(
		workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("spml.lsp")) {
				restart().catch((e) =>
					outputChannel.appendLine(`Failed to restart LSPML: ${e}`),
				);
			}
		}),
	);

	client.start().then(() => {
		outputChannel.appendLine("Started LSPML!");
	});
}

export async function deactivate(): Promise<void> {
	try {
		await client?.stop();
	} catch (e) {
		// `stop` rejects when the client never reached a running state, e.g.
		// because the server failed to spawn or is still starting up.
		console.error(e);
	}
	client = undefined;
}
