// @ts-check
const { LanguageClient } = require("vscode-languageclient/node");

const MODULES_FILE = null //path to modules-file.json
const DEBUG_LOG_LEVEL = "INFO";

module.exports = {
    /** @param {import("vscode").ExtensionContext} context*/
    activate(context) {
        /** @type {import("vscode-languageclient/node").ServerOptions} */
        const serverOptions = {
            run: {
                command: "lspml",
                args: MODULES_FILE ? ["--modules-file", MODULES_FILE] : [],
            },
            debug: {
                command: "lspml",
                args: ["--log-level", DEBUG_LOG_LEVEL, ...(MODULES_FILE ? ["--modules-file", MODULES_FILE] : [])],
            },
        };

        /** @type {import("vscode-languageclient/node").LanguageClientOptions} */
        const clientOptions = {
            documentSelector: [{ scheme: "file", language: "spml" }],

        };

        const client = new LanguageClient(
            "lspml",
            "SPML Language Server",
            serverOptions,
            clientOptions
        );
        client.start();
    },
};