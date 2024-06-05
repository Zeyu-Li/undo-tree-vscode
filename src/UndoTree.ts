import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { randomUUID } from 'crypto';

export class UndoTree {
    private root: TreeNode;
    private currentNode: TreeNode;
    private stateCounter: number = 1;
    private showTimecode = false; // show timecode is false by default

    constructor(initialState: string) {
        this.root = { state: initialState, children: [], parent: null, hash: randomUUID(), datetime: new Date(), count: 0 };
        this.currentNode = this.root;
    }

    addState(newState: string): number {
        /**
         * adds state and returns how many children are in the parent node
         */
        const newNode: TreeNode = { state: newState, children: [], parent: this.currentNode, hash: randomUUID(), datetime: new Date(), count: this.stateCounter };
        this.stateCounter++;
        this.currentNode.children.push(newNode);
        const child_count = this.currentNode.children.length
        this.currentNode = newNode;
        return child_count
    }

    toggleTimecode() {
        this.showTimecode = !this.showTimecode;
    }

    getShowTimecode() {
        return this.showTimecode;
    }

    undo() {
        // must check parent parent, because root is not actually a valid state
        if (this.currentNode.parent && this.currentNode.parent.parent) {
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

    reset(initialState: string) {
        this.root = { state: initialState, children: [], parent: null, hash: randomUUID(), datetime: new Date(), count: 0 };
        this.currentNode = this.root;
        this.stateCounter = 1
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
