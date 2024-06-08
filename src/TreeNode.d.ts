export interface TreeNode {
    state: string;
    children: TreeNode[];
    parent: TreeNode | null;
    hash: string;
    datetime: Date;
    count: number;
}
