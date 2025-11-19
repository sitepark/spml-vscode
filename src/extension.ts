import * as fs from "node:fs";
import { commands, type ExtensionContext, window, workspace } from "vscode";
import type { LanguageClient } from "vscode-languageclient/node";
import { createLogFileReader } from "./createLogFileReader";
import { createLanguageClient, getLogFile } from "./lspml";

let client: LanguageClient;

export async function activate(ctx: ExtensionContext) {
	const outputChannel = window.createOutputChannel("SPML", "spml");
	const restart = () => {
		console.log("RESTART");
		outputChannel.appendLine("RESTART");
		deactivate();
		for (const sub of ctx.subscriptions) {
			try {
				sub.dispose();
			} catch (e) {
				console.error(e);
			}
		}
		activate(ctx);
	};

	const logChannel = window.createOutputChannel("LSPML", {
		log: true,
	});

	client = await createLanguageClient(ctx);
	client.start().then(() => {
		outputChannel.appendLine("Started LSPML!");
	});

	const logFile = await getLogFile(ctx);
	ctx.subscriptions.push(client);
	ctx.subscriptions.push(outputChannel, logChannel);
	ctx.subscriptions.push(createLogFileReader(logFile, logChannel));
	ctx.subscriptions.push({
		dispose: () => {
			fs.existsSync(logFile) && fs.unlinkSync(logFile);
		},
	});
	ctx.subscriptions.push(
		commands.registerCommand("spml.restart", () => restart()),
	);
	ctx.subscriptions.push(
		workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("spml.lsp")) {
				restart();
			}
		}),
	);
}

export function deactivate(): Thenable<void> {
	return client?.stop();
}
