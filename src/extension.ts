import * as vscode from 'vscode';
import { UndoTree } from './UndoTree';
import { UndoTreeProvider } from './UndoTreeProvider';
import { TreeNode } from './TreeNode';

let undoTree: UndoTree;
let treeDataProvider: UndoTreeProvider;

// TODO: reset node tree button && change icons
export function activate(context: vscode.ExtensionContext) {
    const initialState = vscode.window.activeTextEditor?.document.getText() || '';
    undoTree = new UndoTree(initialState);
    // init default on load as node
    undoTree.addState(initialState);

    const undoFunc = () => {
        /**
         * Undos 
         */
		const text_buff = vscode.window.activeTextEditor?.document.getText() || ''
        // if no change, don't do anything
        if (text_buff !== undoTree.getCurrentNode().state) {
            undoTree.addState(text_buff);
        }
        undoTree.undo();
        treeDataProvider.refresh();
        // vscode.commands.executeCommand("undo")
    }

    // vscode.workspace.onDidChangeTextDocument(event => {
    //     undoTree.addState(event.document.getText());
    //     treeDataProvider.refresh();
    // });

    vscode.commands.registerCommand('extension.undo', undoFunc);

    vscode.commands.registerCommand('extension.redo', () => {
        undoTree.redo(0); // Assuming single child for simplicity, takes the first in history
        treeDataProvider.refresh();
        // vscode.commands.executeCommand("redo")
    });

    vscode.commands.registerCommand('extension.gotoState', (node: TreeNode) => {
        undoTree.gotoNode(node);
        treeDataProvider.refresh();
    });

    vscode.commands.registerCommand('extension.resetTree', () => {
        const newInitState = vscode.window.activeTextEditor?.document.getText() || '';
        undoTree.reset(newInitState);
        undoTree.addState(newInitState);

        treeDataProvider.refresh();
    });

    vscode.commands.registerCommand('extension.saveAndAdvance', () => {
		const text_buff = vscode.window.activeTextEditor?.document.getText() || ''
        // if no change, don't do anything
        if (text_buff !== undoTree.getCurrentNode().state) {
            const nodeCount = undoTree.addState(text_buff);
            undoTree.redo(nodeCount-1);
            treeDataProvider.refresh();
        }
    });

    vscode.commands.registerCommand('extension.toggleTimecode', () => {
        undoTree.toggleTimecode();
        treeDataProvider.refresh();
    });

    treeDataProvider = new UndoTreeProvider(undoTree);
    vscode.window.registerTreeDataProvider('undoTreeView', treeDataProvider);

    vscode.commands.registerCommand('extension.refreshTree', () => {
        treeDataProvider.refresh();
    });
}

export function deactivate() {}
