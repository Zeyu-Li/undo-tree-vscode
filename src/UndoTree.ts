import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { randomUUID } from 'crypto';

export class UndoTree {
    private root: TreeNode;
    private currentNode: TreeNode;

    constructor(initialState: string) {
        this.root = { state: initialState, children: [], parent: null, hash: randomUUID() };
        this.currentNode = this.root;
    }

    addState(newState: string) {
        const newNode: TreeNode = { state: newState, children: [], parent: this.currentNode, hash: randomUUID() };
        this.currentNode.children.push(newNode);
        this.currentNode = newNode;
    }

    undo() {
        if (this.currentNode.parent) {
            this.currentNode = this.currentNode.parent;
            this.restoreState();
            // this.currentNode = this.currentNode.children[0];
        }
    }

    redo(childIndex: number) {
        if (this.currentNode.children[childIndex]) {
            this.currentNode = this.currentNode.children[childIndex];
            this.restoreState();
        }
    }

    gotoNode(node: TreeNode) {
        this.currentNode = node;
        this.restoreState();
    }

    restoreState() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                editor.document.positionAt(0),
                editor.document.positionAt(editor.document.getText().length)
            );
            edit.replace(editor.document.uri, fullRange, this.currentNode.state);
            vscode.workspace.applyEdit(edit);
        }
    }

    getCurrentNode(): TreeNode {
        return this.currentNode;
    }

    getRoot(): TreeNode {
        return this.root;
    }
}
