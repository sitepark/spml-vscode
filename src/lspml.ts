import * as fs from "node:fs";
import * as path from "node:path";
import { ExtensionContext, workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { getLogDir, getStorageDir } from "./util/storage";

export type LspmlLogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN";
export type LspmlArgs = {
  "log-level"?: LspmlLogLevel;
  "log-file"?: string;
  "modules-file"?: string;
};

export interface ModuleMappingFile {
  [key: string]: {
    path: string;
  };
}

export interface LogLine {
  level: LspmlLogLevel;
  message: string;
  target: string;
  timestamp: number;
}

export interface ModuleMappingEntry {
  id: string;
  path: string;
}

export function getLspmlPath(ctx: ExtensionContext): string {
  const arch = process.arch;
  if (arch === "x64") {
    return ctx.asAbsolutePath("resources/lspml_x86");
  }
  throw new Error(`Unsupported architecture ${arch}`);
}

export function convertArgsToArray(args: LspmlArgs): string[] {
  return Object.entries(args)
    .map(([key, value]) => {
      return [`--${key}`, value];
    })
    .flat();
}

async function getLspmlArgs(ctx: ExtensionContext): Promise<LspmlArgs> {
  const configuration = workspace.getConfiguration();
  const args: LspmlArgs = {
    "log-level":
      configuration.get<LspmlLogLevel>("spml.lsp.loglevel") ?? "INFO",
  };
  args["log-file"] = await getLogFile(ctx);

  const moduleFile = await getModuleMapping(ctx);
  if (moduleFile) {
    args["modules-file"] = moduleFile;
  }
  return args;
}

export async function getLogFile(ctx: ExtensionContext) {
  const logDir = await getLogDir(ctx);
  const logFile = path.join(logDir, "lspml.log");
  fs.existsSync(logFile) && fs.unlinkSync(logFile);
  return logFile;
}

async function getModuleMapping(ctx: ExtensionContext) {
  const storageDir = await getStorageDir(ctx);
  let moduleFile = null;
  if (storageDir) {
    moduleFile = path.join(storageDir, "modules-file.json");
    const moduleMappings: ModuleMappingFile = {};
    for (const mapping of workspace
      .getConfiguration()
      .get<ModuleMappingEntry[]>("spml.lsp.moduleMapping") ?? []) {
      moduleMappings[mapping.id] = {
        path: mapping.path,
      };
    }
    fs.writeFileSync(moduleFile, JSON.stringify(moduleMappings, null, "\t"), {
      encoding: "utf-8",
    });
  }
  return moduleFile;
}

export async function createLanguageClient(
  ctx: ExtensionContext,
): Promise<LanguageClient> {
  const args = await getLspmlArgs(ctx);
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