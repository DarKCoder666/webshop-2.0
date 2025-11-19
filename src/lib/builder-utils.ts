
import { BlockInstance, ComponentInstance } from "@/lib/builder-types";

type NodeResult = {
  node: ComponentInstance | BlockInstance;
  parent: ComponentInstance | BlockInstance | null;
  index: number;
  path: string[]; // IDs path
};

export function findNode(
  nodes: (ComponentInstance | BlockInstance)[],
  id: string,
  parent: ComponentInstance | BlockInstance | null = null,
  index: number = -1,
  path: string[] = []
): NodeResult | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const currentPath = [...path, node.id];

    if (node.id === id) {
      return { node, parent, index: i, path: currentPath };
    }

    if (node.children && node.children.length > 0) {
      const result = findNode(node.children, id, node, i, currentPath);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

export function findBlockForComponent(blocks: BlockInstance[], componentId: string): BlockInstance | undefined {
    for (const block of blocks) {
        if (block.id === componentId) return block;
        if (block.children) {
            if (findNode(block.children, componentId)) return block;
        }
    }
    return undefined;
}

