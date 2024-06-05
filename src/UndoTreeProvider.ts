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

    private timeDifference(newDate: number, oldDate: number) {
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

    private getTreeItems(node: TreeNode): TreeNodeItem[] {
        return node.children.map(
            (child, index) => 
                new TreeNodeItem(`State ${child.count}${child.hash === this.undoTree.getCurrentNode().hash ? " *": ""} ${this.undoTree.getShowTimecode() ? `(${this.timeDifference(new Date().getTime(), child.datetime.getTime())} ago)`: ""}`, child)
        );
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class TreeNodeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly node: TreeNode,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
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
