export interface TreeNode {
    state: string;
    children: TreeNode[];
    parent: TreeNode | null;
}
