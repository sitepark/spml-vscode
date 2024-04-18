import { ExtensionContext } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";


const PATH_TO_MODULES_FILE = null; //optional path to modules-file.json. See Readme at https://github.com/DrWursterich/lspml
const DEBUG_LOG_LEVEL = "TRACE";

export function activate(context: ExtensionContext) {
  const lspmlPath = context.asAbsolutePath("resources/lspml");
  console.log("Starting LSPML... " + context.asAbsolutePath("resources/lspml"));
  const args = [
    "--log-level",
    DEBUG_LOG_LEVEL,
    "--log-file",
    "/var/log/lspml.log",
    "--modules-file",
    "/home/schleuse/lspml-modules.json"
  ];
  if (PATH_TO_MODULES_FILE) {
    args.push("--modules-file", PATH_TO_MODULES_FILE);
  }

  const serverOptions: ServerOptions = {
    run: {
      command: lspmlPath,
      args: args,
    },
    debug: {
      command: lspmlPath,
      args: args,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "spml" }],
    progressOnInitialization: true
  };

  const client = new LanguageClient(
    "lspml",
    "SPML Language Server",
    serverOptions,
    clientOptions
  );
  client.start().then(() => {
    console.log("Started LSPML!");
  })
  context.subscriptions.push(client);
}


export function deactivate() {
}