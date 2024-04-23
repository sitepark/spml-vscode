import * as readline from "node:readline";
import {
  ExtensionContext,
  LogOutputChannel,
  commands,
  window,
  workspace
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from "vscode-languageclient/node";

import * as fs from "node:fs";
import * as path from "node:path";

let client: LanguageClient;

type LspmlLogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN";
type LspmlArgs = {
  "log-level"?: LspmlLogLevel;
  "log-file"?: string;
  "modules-file"?: string;
};

function getLspmlPath(ctx: ExtensionContext): string {
  const arch = process.arch;
  if (arch === "x64") {
    return ctx.asAbsolutePath("resources/lspml_x86");
  }
  throw new Error(`Unsupported architecture ${arch}`);
}

function convertArgsToArray(args: LspmlArgs): string[] {
  return Object.entries(args)
    .map(([key, value]) => {
      return [`--${key}`, value];
    })
    .flat();
}

function getLspmlArgs(): LspmlArgs {
  const configuration = workspace.getConfiguration();
  const args: LspmlArgs = {
    "log-level":
      configuration.get<LspmlLogLevel>("spml.lsp.loglevel") ?? "INFO",
  };
  return args;
}

async function getLogDir(ctx: ExtensionContext): Promise<string> {
  const path = ctx.logUri;
  await workspace.fs.createDirectory(path);
  return path.fsPath;
}

async function getStorageDir(ctx: ExtensionContext): Promise<string | void> {
  const path = ctx.storageUri;
  if (path === undefined)  {
    return;
  }
  await workspace.fs.createDirectory(path);
  return path.fsPath;
}

interface LogLine {
  level: LspmlLogLevel,
  message: string,
  target: string,
  timestamp: number
}

interface ModuleMappingEntry {
  id: string,
  path: string
}

function createLogFileReader(
  logFilePath: string,
  outputChannel: LogOutputChannel
) {
  let lastReadPosition = 0;

  const logMapping: Record<LspmlLogLevel, (msg: string) => void> = {
    "DEBUG": outputChannel.debug,
    "INFO": outputChannel.info,
    "TRACE": outputChannel.trace,
    "WARN": outputChannel.warn
  };

  function displayNewLogFileContent() {
    const fileStream = fs.createReadStream(logFilePath, {
      start: lastReadPosition,
    });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
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

interface ModuleMappingFile {
  [key: string]: {
    path: string
  }
}

export async function activate(ctx: ExtensionContext) {
  ctx.subscriptions.push(
    commands.registerCommand("spml.restart", () => client.restart())
  );

  const logDir = await getLogDir(ctx);
  const logFile = path.join(logDir, "lspml.log");
  fs.existsSync(logFile) && fs.unlinkSync(logFile);

  const outputChannel = window.createOutputChannel("SPML", {
    log: true,
  });

  const storageDir = await getStorageDir(ctx);
  let moduleFile = null;
  if (storageDir) {
    moduleFile = path.join(storageDir, "modules-file.json");
    const moduleMappings: ModuleMappingFile = {};
    for (const mapping of workspace.getConfiguration().get<ModuleMappingEntry[]>("spml.lsp.moduleMapping") ?? []) {
      moduleMappings[mapping.id] = {
        path: mapping.path
      }
    }
    outputChannel.info("Using Module-Mapping: " + JSON.stringify(moduleMappings, null, 2));
    fs.writeFileSync(moduleFile, JSON.stringify(moduleMappings, null, "\t"), {
      encoding: 'utf-8'
    })
  }

  const lspmlPath = getLspmlPath(ctx);

  const args: LspmlArgs = getLspmlArgs();
  args["log-file"] = logFile;
  if (moduleFile) {
    args["modules-file"] = moduleFile;
  }

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

  client = new LanguageClient(
    "lspml",
    "SPML Language Server",
    serverOptions,
    clientOptions
  );

  client.start().then(() => {
    outputChannel.appendLine("Started LSPML!");
  });
  ctx.subscriptions.push(client);
  ctx.subscriptions.push(outputChannel);
  ctx.subscriptions.push(createLogFileReader(logFile, outputChannel));
  ctx.subscriptions.push({
    dispose: () => {
      fs.existsSync(logFile) && fs.unlinkSync(logFile);
    }
  })
}

export function deactivate(): Thenable<void> {
  return client?.stop();
}
