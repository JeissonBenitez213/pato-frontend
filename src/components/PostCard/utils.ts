import type { PostComment } from "./types";

export function isVideo(ext?: string) {
  return !!ext && ["mp4", "webm", "ogg", "mov"].includes(ext.toLowerCase());
}

export function buildTree(list: PostComment[]) {
  const map = new Map<number, PostComment & { children: PostComment[] }>();

  for (const c of list) {
    map.set(Number(c.id_comentario), {
      ...c,
      children: [],
    });
  }

  const roots: Array<PostComment & { children: PostComment[] }> = [];

  for (const c of list) {
    const node = map.get(Number(c.id_comentario));

    if (!node) {
      continue;
    }

    const parentId =
      c.id_comentario_padre !== null && c.id_comentario_padre !== undefined
        ? Number(c.id_comentario_padre)
        : null;

    if (parentId === null) {
      roots.push(node);
      continue;
    }

    const parent = map.get(parentId);

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
