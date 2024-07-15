"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const filters = [];
// margin
addFilter("mt", "mbs");
addFilter("mr", "mie");
addFilter("ml", "mis");
addFilter("mb", "mbe");
addFilter("my", "mlb");
addFilter("mx", "mli");
//padding
addFilter("pt", "pbs");
addFilter("pr", "pie");
addFilter("pl", "pis");
addFilter("pb", "pbe");
addFilter("py", "plb");
addFilter("px", "pli");
// inset
addFilter("left", "inline-start");
addFilter("right", "inline-end");
addFilter("inset-y", "inset-block");
addFilter("inset-x", "inset-inline");
addFilter("top", "block-start");
addFilter("bottom", "block-end");
// borders
addFilter("border-x", "border-lb");
addFilter("border-y", "border-li");
function activate(context) {
    const disposable = vscode.commands.registerCommand("tailwind-enforce-logical.format", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const text = document.getText();
        const edit = new vscode.WorkspaceEdit();
        if (!document || !text) {
            return;
        }
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        if (!fullRange) {
            return;
        }
        edit.replace(document.uri, fullRange, formatDocument(text));
        vscode.workspace.applyEdit(edit);
    });
    context.subscriptions.push(disposable);
}
function addFilter(physical, logical) {
    filters.push({
        physical: physical + "-",
        logical: logical + "-",
    });
}
function replaceClass(classesString, filter) {
    const output = classesString
        .replaceAll(" " + filter.physical, " " + filter.logical)
        .replaceAll(":" + filter.physical, ":" + filter.logical)
        .replaceAll(":-" + filter.physical, ":-" + filter.logical)
        .replaceAll(" -" + filter.physical, " -" + filter.logical);
    if (classesString.startsWith(filter.physical)) {
        return output.replace(filter.physical, filter.logical);
    }
    return output;
}
function replaceClasses(classesString) {
    // Regex removes all multiple spaces
    let output = classesString.replace(/\s\s+/g, " ");
    filters.forEach((filter) => {
        output = replaceClass(output, filter);
    });
    return output;
}
// replaceClasses(classesString, filters);
function formatDocument(text) {
    let outputText = "";
    let restOfText = text;
    while (restOfText.includes("<")) {
        // find a node that by looking for < and a >
        const startsAt = restOfText.indexOf("<");
        const endsAt = restOfText.indexOf(">", startsAt) + 1;
        const currentTag = restOfText.substring(startsAt, endsAt);
        // find if the node has a class attribute
        const classStartsAt = currentTag.indexOf('class="') + 7;
        const classEndsAt = currentTag.indexOf('"', classStartsAt);
        if (classStartsAt > 7) {
            // find the current classes and replace them
            const appendedClasses = currentTag.substring(classStartsAt, classEndsAt);
            const newClasses = replaceClasses(appendedClasses);
            outputText += restOfText.substring(0, startsAt + classStartsAt);
            outputText += newClasses;
            outputText += restOfText.substring(restOfText.indexOf(appendedClasses) + appendedClasses.length, endsAt);
        }
        else {
            outputText += restOfText.substring(0, endsAt);
        }
        restOfText = restOfText.substring(endsAt);
    }
    return outputText;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map