import * as vscode from "vscode";

interface Filter {
  physical: string;
  logical: string;
  nodash?: boolean;
}

const filters: Filter[] = [];

// margin
addPropertyPair("mt", "mbs");
addPropertyPair("mr", "mie");
addPropertyPair("ml", "mis");
addPropertyPair("mb", "mbe");
addPropertyPair("my", "mlb");
addPropertyPair("mx", "mli");

//padding
addPropertyPair("pt", "pbs");
addPropertyPair("pr", "pie");
addPropertyPair("pl", "pis");
addPropertyPair("pb", "pbe");
addPropertyPair("py", "plb");
addPropertyPair("px", "pli");

// inset
addPropertyPair("left", "inline-start");
addPropertyPair("right", "inline-end");
addPropertyPair("inset-y", "inset-block");
addPropertyPair("inset-x", "inset-inline");
addPropertyPair("top", "block-start");
addPropertyPair("bottom", "block-end");

// borders
addPropertyPair("border-x", "border-lb");
addPropertyPair("border-y", "border-li");
addPropertyPair("border-t", "border-bs");
addPropertyPair("border-b", "border-be");
addPropertyPair("border-l", "border-is");
addPropertyPair("border-r", "border-ie");

// border-radius
addPropertyPair("rounded-t", "rounded-bs");
addPropertyPair("rounded-r", "rounded-ie");
addPropertyPair("rounded-b", "rounded-be");
addPropertyPair("rounded-l", "rounded-is");
addPropertyPair("rounded-l", "rounded-is");
addPropertyPair("rounded-tl", "rounded-ss");
addPropertyPair("rounded-tr", "rounded-se");
addPropertyPair("rounded-br", "rounded-ee");
addPropertyPair("rounded-bl", "rounded-es");

// text-align
addPropertyPair("text-left", "text-start", true);
addPropertyPair("text-right", "text-end", true);

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "tailwindEnforceLogical",
    () => {
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

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );

      if (!fullRange) {
        return;
      }

      if (text === formatDocument(text)) {
        return;
      }
      edit.replace(document.uri, fullRange, formatDocument(text));
      vscode.workspace.applyEdit(edit);
    }
  );

  context.subscriptions.push(disposable);

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    if (
      document.languageId === "html" ||
      document.languageId === "vue" ||
      document.languageId === "vue-html"
    ) {
      vscode.commands.executeCommand("tailwindEnforceLogical");
    }
  });
}

function addPropertyPair(physical: string, logical: string, nodash?: boolean) {
  if (nodash) {
    filters.push({
      physical: physical,
      logical: logical,
    });
  } else {
    filters.push({
      physical: physical + "-",
      logical: logical + "-",
    });
  }
}

function replaceClass(classesString: string, filter: Filter) {
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
function replaceClasses(classesString: string) {
  // Regex removes multiple spaces
  let output = classesString.replace(/\s\s+/g, " ");
  filters.forEach((filter) => {
    output = replaceClass(output, filter);
  });
  return output;
}

function formatDocument(text: string) {
  let outputText = "";
  let restOfText = text;
  const classAttribute = 'class="';

  while (restOfText.includes("<")) {
    // find a node by looking for < and a >
    const startsAt = restOfText.indexOf("<");
    const endsAt = restOfText.indexOf(">", startsAt) + ">".length;
    const currentTag = restOfText.substring(startsAt, endsAt);

    // find if the node has a class attribute
    const classStartsAt =
      currentTag.indexOf(classAttribute) + classAttribute.length;
    const classEndsAt = currentTag.indexOf('"', classStartsAt);

    if (classStartsAt > 7) {
      // find the current classes and replace them
      const appendedClasses = currentTag.substring(classStartsAt, classEndsAt);
      const newClasses = replaceClasses(appendedClasses);

      outputText += restOfText.substring(0, startsAt + classStartsAt);
      outputText += newClasses;
      outputText += restOfText.substring(
        restOfText.indexOf(appendedClasses) + appendedClasses.length,
        endsAt
      );
    } else {
      outputText += restOfText.substring(0, endsAt);
    }
    restOfText = restOfText.substring(endsAt);
  }
  return outputText;
}

export function deactivate() {}
