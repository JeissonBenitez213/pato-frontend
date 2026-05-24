export interface CommentReactions {
  like?: boolean;
  share?: boolean;
  commented?: boolean;
}

export interface PostComment {
  id_comentario: number | string;
  texto: string;
  fecha?: string;
  id_comentario_padre?: number | null;
  id_post?: number | null;
  likes?: number;
  shares?: number;
  reacted?: CommentReactions;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    avatar?: string | null;
  };
  children?: PostComment[];
}
