import type { ExtensionContext } from "vscode";
import {
	LanguageClient,
	type LanguageClientOptions,
	type ServerOptions,
} from "vscode-languageclient/node";
import { convertArgsToArray, getLspmlArgs, getLspmlPath } from "./lspml";

export async function createLanguageClient(
	ctx: ExtensionContext,
	logFile: string,
): Promise<LanguageClient> {
	const args = await getLspmlArgs(ctx, logFile);
	const lspmlPath = getLspmlPath(ctx);
	const serverOptions: ServerOptions = {
		run: {
			command: lspmlPath,
			args: convertArgsToArray(args),
		},
		debug: {
			command: lspmlPath,
			args: convertArgsToArray(args),
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: "file", language: "spml" }],
		progressOnInitialization: true,
		markdown: {
			isTrusted: true,
			supportHtml: true,
		},
	};

	return new LanguageClient(
		"lspml",
		"SPML Language Server",
		serverOptions,
		clientOptions,
	);
}
