/**
 * This file houses the common interfaces to vscode tree sdk
 * for the sidebar. It also handles the utils for actions
 * made with the sidebar or when you open a new document
 */

import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { UndoTree } from './UndoTree';

export class UndoTreeProvider implements vscode.TreeDataProvider<TreeNodeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        TreeNodeItem | undefined | null | void
    > = new vscode.EventEmitter<TreeNodeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<
        TreeNodeItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    private undoTrees: Map<string, UndoTree> = new Map();

    constructor() {}

    getTreeItem(element: TreeNodeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNodeItem): Thenable<TreeNodeItem[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return Promise.resolve([]);
        }

        const uri = editor.document.uri.toString();
        const undoTree = this.undoTrees.get(uri);

        if (!undoTree) {
            return Promise.resolve([]);
        }

        if (!element) {
            return Promise.resolve(this.getTreeItems(undoTree.getRoot()));
        }
        return Promise.resolve(this.getTreeItems(element.node));
    }

    /**
     * The time elapsed in a nicely formatted string of the most significant digit.
     * For example:
     *      1 minute
     *      3 minutes
     *      4 seconds
     * @param newDate new date
     * @param oldDate old date
     * @returns nicely formatted dates
     */
    private timeDifference(newDate: number, oldDate: number): string {
        const msPerSecond = 1000;
        const msPerMinute = msPerSecond * 60;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        const difference = newDate - oldDate;

        if (difference < msPerMinute) {
            const seconds = Math.floor(difference / msPerSecond);
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else if (difference < msPerHour) {
            const minutes = Math.floor(difference / msPerMinute);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (difference < msPerDay) {
            const hours = Math.floor(difference / msPerHour);
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
            const days = Math.floor(difference / msPerDay);
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Gets all child nodes of the input node as TreeNodeItems[]
     * @param node get the tree nodes along with labels
     * @returns list of child nodes
     */
    private getTreeItems(node: TreeNode): TreeNodeItem[] {
        return node.children.map(
            (child) =>
                new TreeNodeItem(
                    `State ${child.count}${
                        child.hash ===
                        this.getUndoTreeForActiveEditor()?.getCurrentNode().hash
                            ? ' *'
                            : ''
                    } ${
                        this.getUndoTreeForActiveEditor()?.getShowTimecode()
                            ? `\t(${this.timeDifference(
                                  new Date().getTime(),
                                  child.datetime.getTime()
                              )} ago)`
                            : ''
                    }`,
                    child
                )
        );
    }

    /**
     * Either creates an undotree for current active editor
     * @param document the current open document in active editor
     */
    ensureUndoTreeForDocument(document: vscode.TextDocument) {
        const uri = document.uri.toString();
        if (!this.undoTrees.has(uri)) {
            const newUndoTree = new UndoTree(document.getText());
            this.undoTrees.set(uri, newUndoTree);
            newUndoTree.addState(document.getText());
        }
    }

    /**
     * Get the undo tree for the active editor or undefined
     * @returns undefined or the undotree for the active editor
     */
    getUndoTreeForActiveEditor(): UndoTree | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }
        this.ensureUndoTreeForDocument(editor.document);
        return this.undoTrees.get(editor.document.uri.toString());
    }

    /**
     * Rerenders TreeDataProvider
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class TreeNodeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly node: TreeNode,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
            .TreeItemCollapsibleState.Expanded
    ) {
        super(label, collapsibleState);
        this.command = {
            command: 'undotree.gotoState',
            title: 'Go to State',
            arguments: [node]
        };
    }

    contextValue = 'treeNodeItem';
}
