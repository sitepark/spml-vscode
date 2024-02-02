// @ts-check
const { LanguageClient } = require("vscode-languageclient/node");

const PATH_TO_LSPML_BINARY = "/home/felix/git/lspml/target/debug/lspml" //path to lspml (spml language server) binary 
const PATH_TO_MODULES_FILE = null //optional path to modules-file.json. See Readme at https://github.com/DrWursterich/lspml 
const DEBUG_LOG_LEVEL = "INFO";

module.exports = {
    /** @param {import("vscode").ExtensionContext} context*/
    activate(context) {
        /** @type {import("vscode-languageclient/node").ServerOptions} */
        const serverOptions = {
            run: {
                command: PATH_TO_LSPML_BINARY,
                args: PATH_TO_MODULES_FILE ? ["--modules-file", PATH_TO_MODULES_FILE] : [],
            },
            debug: {
                command: PATH_TO_LSPML_BINARY,
                args: [
                    "--log-level", DEBUG_LOG_LEVEL,
                    ...(PATH_TO_MODULES_FILE ? ["--modules-file", PATH_TO_MODULES_FILE] : [])
                ],
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