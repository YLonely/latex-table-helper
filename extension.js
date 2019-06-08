// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('extension.createTable', function () {
		let editor = vscode.window.activeTextEditor;
		let text = "";
		let reg = /\\table (\d+) (\d+) ((\w|[^\x00-\xff ]| )+)/;
		let selectLine = 0;
		if (editor) {
			let doc = editor.document;
			let select = editor.selection;
			selectLine = select.active.line;
			text = doc.lineAt(selectLine).text;
		}
		let res = text.match(reg);
		if (!res) {
			vscode.window.showErrorMessage("Wrong parameter format (\\table rows columns caption).");
			return;
		}
		let [rows, columns, caption] = [Number(res[1]), Number(res[2]), res[3]];
		if (rows <= 0 || columns <= 0) {
			vscode.window.showErrorMessage("Rows or columns must be greater than 0.");
			return;
		}
		let formatFlags = "";
		for (let i = 0; i < columns; i++)
			formatFlags += "c";
		let template1 = "\\begin{table}[htbp]\n\t\\centering\n\t\\caption{" + caption + "}\n\t\\begin{tabular}{" + formatFlags + "}\n\t\t\\hline\n";
		let template2 = "\t\\end{tabular}\n\\end{table}\n";
		let innerTemplate = "";
		let innerRow = "";
		let tempArray = new Array(columns);
		for (let i = 0; i < tempArray.length; i++) {
			tempArray[i] = "A ";
		}
		innerRow = tempArray.join("& ");
		for (let i = 0; i < rows; i++) {
			innerTemplate += "\t\t" + innerRow + "\\\\";
			if (i == 0 || i == rows - 1) {
				innerTemplate += " \\hline";
			}
			innerTemplate += "\n"
		}
		let generatedTable = template1 + innerTemplate + template2;
		let [lineStart, lineEnd] = [res.index, res.index + res[0].length];
		editor.edit(editBuilder => {
			let range = new vscode.Range(selectLine, lineStart, selectLine, lineEnd);
			editBuilder.replace(range, generatedTable);
		});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
