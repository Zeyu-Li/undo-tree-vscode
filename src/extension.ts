// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as d3 from 'd3';

interface ContentChanges {
	id: number;
	changes: readonly vscode.TextDocumentContentChangeEvent[];
}

class TreeNode<T> {
    value: T;
	parent: TreeNode<T>;
    children: TreeNode<T>[];
	
    constructor(value: T, parent?: TreeNode<T>) {
        this.value = value;
        this.children = [];

		if (parent) {
			this.parent = parent;
		} else {
			// If the node doesn't have a parent then point to itself.
			this.parent = this;
		}
    }

    addChild(node: TreeNode<T>): void {
        this.children.push(node);
    }
}

let id=0;

// TODO: file->undotree
//		 each file should have its own undoTree
let root:TreeNode<ContentChanges> = new TreeNode({id: id, changes: []});;
let cur:TreeNode<ContentChanges> = root;


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "undo-tree" is now active!');

	let moveBelow = vscode.commands.registerCommand('undo-tree.goDown', () => {
        // Code to execute when the command is triggered
        // vscode.window.showInformationMessage('Key pressed!');
    });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('undo-tree.captureUndo', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		// TODO: read undoTree from disk

		vscode.workspace.onDidChangeTextDocument((event) => {
			// Check if the changes are related to user actions (e.g., undo)
			
			cur.addChild(new TreeNode<ContentChanges>({id: id+1, changes:event.contentChanges}));

			/* 
				* <event>: TextDocumentChangeEvent
				* Has 3 attributes:
					1. contentChanges: contains the changes
						- could we restore the state using this changes?
					2. document: file in question
						- should be able to index into the hashmap of undoTrees
					3. reason: undo(1) and redo(2)
						- Only present if the changes come from undo or redo
				* reference: https://code.visualstudio.com/api/references/vscode-api#TextDocumentChangeEvent
			*/
			
			if (event.reason != undefined) {
				console.log("undo or redo");
				console.log(event);
			}
		});
	});

	context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}
