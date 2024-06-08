/**
 * This is the main node object for each text editor
 */

import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { randomUUID } from 'crypto';

export class UndoTree {
    private root: TreeNode; // this is a placeholder node
    private currentNode: TreeNode; // this is the node in focus
    private stateCounter: number = 1; // counts how many states are tracked
    private showTimecode = false; // show timecode is false by default

    constructor(initialState: string) {
        this.root = {
            state: initialState,
            children: [],
            parent: null,
            hash: randomUUID(),
            datetime: new Date(),
            count: 0
        };
        this.currentNode = this.root;
    }

    /**
     * Adds state and returns how many children are in the parent node
     * @param newState new node state
     * @returns how many children are in the current node
     */
    addState(newState: string): number {
        const newNode: TreeNode = {
            state: newState,
            children: [],
            parent: this.currentNode,
            hash: randomUUID(),
            datetime: new Date(),
            count: this.stateCounter
        };
        this.stateCounter++;
        this.currentNode.children.push(newNode);
        const child_count = this.currentNode.children.length;
        this.currentNode = newNode;
        return child_count;
    }

    /**
     * If it is not the child of the root node, go to parent node
     */
    undo() {
        // must check parent parent, because root is not actually a valid state
        if (this.currentNode.parent && this.currentNode.parent.parent) {
            this.currentNode = this.currentNode.parent;
            this.restoreState();
            // this.currentNode = this.currentNode.children[0];
        }
    }

    /**
     * Goes to the child node of current node
     * @param childIndex which of the child of current node to go to
     */
    redo(childIndex: number) {
        if (this.currentNode.children[childIndex]) {
            this.currentNode = this.currentNode.children[childIndex];
            this.restoreState();
        }
    }

    /**
     * Change view to given node
     * @param node node to go to
     */
    gotoNode(node: TreeNode) {
        this.currentNode = node;
        this.restoreState();
    }

    /**
     * Resets the tree with a new root
     * @param initialState Hards reset the tree by creating a new root
     */
    reset(initialState: string) {
        this.root = {
            state: initialState,
            children: [],
            parent: null,
            hash: randomUUID(),
            datetime: new Date(),
            count: 0
        };
        this.currentNode = this.root;
        this.stateCounter = 1;
    }

    /**
     * Restores the code of the current state
     */
    restoreState() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                editor.document.positionAt(0),
                editor.document.positionAt(editor.document.getText().length)
            );
            edit.replace(
                editor.document.uri,
                fullRange,
                this.currentNode.state
            );
            vscode.workspace.applyEdit(edit);
        }
    }

    /**
     * Toggles between showing and hiding the timecode
     */
    toggleTimecode() {
        this.showTimecode = !this.showTimecode;
    }

    /**
     * Gets if we should show the timecode
     * @returns if we should show the timecode
     */
    getShowTimecode(): boolean {
        return this.showTimecode;
    }

    /**
     * Gets the current node of the UndoTree
     * @returns current node in focus
     */
    getCurrentNode(): TreeNode {
        return this.currentNode;
    }

    /**
     * Gets the root node
     * @returns root node (this is just a placeholder node)
     */
    getRoot(): TreeNode {
        return this.root;
    }
}
