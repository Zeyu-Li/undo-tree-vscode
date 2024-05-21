import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { UndoTree } from './UndoTree';

export class UndoTreeProvider implements vscode.TreeDataProvider<TreeNodeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeItem | undefined | null | void> = new vscode.EventEmitter<TreeNodeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNodeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private undoTree: UndoTree) {}

    getTreeItem(element: TreeNodeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNodeItem): Thenable<TreeNodeItem[]> {
        if (!element) {
            return Promise.resolve(this.getTreeItems(this.undoTree.getRoot()));
        }
        return Promise.resolve(this.getTreeItems(element.node));
    }

    private getTreeItems(node: TreeNode): TreeNodeItem[] {
        return node.children.map((child, index) => new TreeNodeItem(`State ${index}`, child));
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class TreeNodeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly node: TreeNode,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    ) {
        super(label, collapsibleState);
        this.command = {
            command: 'extension.gotoState',
            title: 'Go to State',
            arguments: [node]
        };
    }

    contextValue = 'treeNodeItem';
}
