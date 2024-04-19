import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import {
  workspace,
  commands,
  ExtensionContext,
  OutputChannel,
  window,
} from "vscode";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("spml.restart", () => client.restart())
  );

  const configuration = workspace.getConfiguration();
  const lspmlPath = context.asAbsolutePath("resources/lspml");

  const args: string[] = [
    "--log-level",
    configuration.get<string>("spml.lsp.loglevel") ?? "INFO",
    // DEBUG_LOG_LEVEL,
    // "--log-file",
    // "/var/log/lspml.log",
    // "--modules-file",
    // "/home/schleuse/lspml-modules.json"
  ];

  const outputChannel = window.createOutputChannel("SPML", "spml");
  const serverOptions: ServerOptions = {
    run: {
      command: lspmlPath,
      args: args,
    },
    debug: {
      command: lspmlPath,
      args: args
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "spml" }],
    progressOnInitialization: true,
    outputChannel: outputChannel,
  };

  client = new LanguageClient(
    "lspml",
    "SPML Language Server",
    serverOptions,
    clientOptions
  );

  client.start().then(() => {
    outputChannel.appendLine("Started LSPML!");
  });
  context.subscriptions.push(client);
}

export function deactivate(): Thenable<void> {
  return client?.stop();
}
