import { ExtensionContext, workspace } from "vscode";

export async function getLogDir(ctx: ExtensionContext): Promise<string> {
  const path = ctx.logUri;
  await workspace.fs.createDirectory(path);
  return path.fsPath;
}

export async function getStorageDir(
  ctx: ExtensionContext,
): Promise<string | void> {
  const path = ctx.storageUri;
  if (path === undefined) {
    return;
  }
  await workspace.fs.createDirectory(path);
  return path.fsPath;
}
