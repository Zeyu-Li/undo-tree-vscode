import * as vscode from 'vscode';
import { UndoTree } from './UndoTree';
import { UndoTreeProvider } from './UndoTreeProvider';
import { TreeNode } from './TreeNode';

let treeDataProvider: UndoTreeProvider;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        // initialize initial text editor as a node on load
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        treeDataProvider.refresh();
    });

    /**
     * If current node is a leaf node with no child,
     * it pushes a new child node and stays
     */
    vscode.commands.registerCommand('undotree.undo', () => {
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        if (!undoTree) return
        const text_buff =
            vscode.window.activeTextEditor?.document.getText() || '';
        // if no change, don't do anything
        if (text_buff !== undoTree.getCurrentNode().state) {
            undoTree.addState(text_buff);
        }
        undoTree.undo();
        treeDataProvider.refresh();
    });

    /**
     * Goes to the first child node of the current node if it exists
     */
    vscode.commands.registerCommand('undotree.redo', () => {
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        if (!undoTree) return
        undoTree.redo(0); // Assuming single child for simplicity, takes the first in history
        treeDataProvider.refresh();
    });

    /**
     * Saves current state as a node and advance to the node. 
     * Can be though of as doing undo and redo in a single action
     */
    vscode.commands.registerCommand('undotree.saveAndAdvance', () => {
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        if (!undoTree) return
        const text_buff =
            vscode.window.activeTextEditor?.document.getText() || '';
        // if no change, don't do anything
        if (text_buff !== undoTree.getCurrentNode().state) {
            const nodeCount = undoTree.addState(text_buff);
            undoTree.redo(nodeCount - 1);
            treeDataProvider.refresh();
        }
    });

    /**
     * Resets the undo tree and keeps the current state as the new root node
     */
    vscode.commands.registerCommand('undotree.resetTree', () => {
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        if (!undoTree) return
        const newInitState =
            vscode.window.activeTextEditor?.document.getText() || '';
        undoTree.reset(newInitState);
        undoTree.addState(newInitState);

        treeDataProvider.refresh();
    });

    /**
     * Toggles if the timecode is displayed on the sidebar or not
     */
    vscode.commands.registerCommand('undotree.toggleTimecode', () => {
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        if (!undoTree) return
        undoTree.toggleTimecode();
        treeDataProvider.refresh();
    });

    /**
     * Go to a specific node
     */
    vscode.commands.registerCommand('undotree.gotoState', (node: TreeNode) => {
        const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
        if (!undoTree) return
        undoTree.gotoNode(node);
        treeDataProvider.refresh();
    });

    /**
     * DEBUG: Refresh tree view on the sidebar
     */
    vscode.commands.registerCommand('undotree.refreshTree', () => {
        treeDataProvider.refresh();
    });

    // finish instantiation
    treeDataProvider = new UndoTreeProvider();
    vscode.window.registerTreeDataProvider('undoTreeView', treeDataProvider);
}

export function deactivate() {}
