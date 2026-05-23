/** Tipos que reflejan el schema GraphQL del backend. */

export interface PostFile {
  id_file: number;
  dir: string;
  file_extension: string;
}

export interface PostStats {
  likes: number;
  comentarios: number;
  shares: number;
  favorites: number;
}

export interface UserLite {
  id_usuario: number;
  nombre_usuario: string;
  avatar: string;
  descripcion?: string | null;
}

export interface Post {
  id_post: number;
  title: string;
  description?: string | null;
  fecha_publicacion: string;
  id_usuario?: number;
  usuario: UserLite;
  files?: PostFile[] | null;
  stats?: PostStats;
  comentarios?: any;
}

export interface Badge {
  id_insignia: number;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
}

export interface BadgeUser {
  id_insignia: number;
  insignia: Badge;
}

export interface Follow {
  follower_id?: number;
  following_id?: number;
}

export interface FullUser extends UserLite {
  email?: string | null;
  fecha_registro: string;
  is_admin: boolean;
  insignias?: BadgeUser[] | null;
  seguidores?: Follow[] | null;
  siguiendo?: Follow[] | null;
  posts?: Post[] | null;
}

export interface Pet {
  id_mascota: number;
  id_usuario: number;
  nivel_actual: number;
  puntos_experiencia: number;
  fecha_ultima_evolucion: string;
}

export interface Dato {
  id: number;
  nombre: string;
  descripcion?: string | null;
}
