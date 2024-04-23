import {
  ExtensionContext,
  commands,
  window,
  workspace
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from "vscode-languageclient/node";

let client: LanguageClient;


function getLspmlPath(context: ExtensionContext): string {
  const arch = process.arch;
  if (arch === "x64") {
    return context.asAbsolutePath("resources/lspml_x86");
  }
  throw new Error(`Unsupported architecture ${arch}`);
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("spml.restart", () => client.restart())
  );

  const configuration = workspace.getConfiguration();

  const lspmlPath = getLspmlPath(context);

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
    markdown: {
      isTrusted: true,
      supportHtml: true
    }
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
