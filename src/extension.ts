import * as vscode from 'vscode';
import { UndoTree } from './UndoTree';
import { UndoTreeProvider } from './UndoTreeProvider';
import { TreeNode } from './TreeNode';

let undoTree: UndoTree;
let treeDataProvider: UndoTreeProvider;

export function activate(context: vscode.ExtensionContext) {
    const initialState = vscode.window.activeTextEditor?.document.getText() || '';
    undoTree = new UndoTree(initialState);
    undoTree.addState(initialState);

    // vscode.workspace.onDidChangeTextDocument(event => {
    //     undoTree.addState(event.document.getText());
    //     treeDataProvider.refresh();
    // });

    vscode.commands.registerCommand('extension.undo', (event) => {
		const text_buff = vscode.window.activeTextEditor?.document.getText() || ''
        // if no change, don't do anything
        if (text_buff !== undoTree.getCurrentNode().state) {
            undoTree.addState(text_buff);
        }
        undoTree.undo();
        treeDataProvider.refresh();
        // vscode.commands.executeCommand("undo")
    });

    vscode.commands.registerCommand('extension.redo', (event) => {
        undoTree.redo(0); // Assuming single child for simplicity
        treeDataProvider.refresh();
        // vscode.commands.executeCommand("redo")
    });

    vscode.commands.registerCommand('extension.gotoState', (node: TreeNode) => {
        undoTree.gotoNode(node);
        treeDataProvider.refresh();
    });

    treeDataProvider = new UndoTreeProvider(undoTree);
    vscode.window.registerTreeDataProvider('undoTreeView', treeDataProvider);

    vscode.commands.registerCommand('extension.refreshTree', () => {
        treeDataProvider.refresh();
    });
}

export function deactivate() {}
