import { ExtensionContext } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";

const PATH_TO_LSPML_BINARY =
  "/home/schleuse/develop/git/forks/lspml/target/debug/lspml"; //path to lspml (spml language server) binary
const PATH_TO_MODULES_FILE = null; //optional path to modules-file.json. See Readme at https://github.com/DrWursterich/lspml
const DEBUG_LOG_LEVEL = "TRACE";

export function activate(context: ExtensionContext) {
  console.log("Starting LSPML...");
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
      command: PATH_TO_LSPML_BINARY,
      args: args,
    },
    debug: {
      command: PATH_TO_LSPML_BINARY,
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