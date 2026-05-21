/**
 * Operaciones GraphQL que coinciden con el schema del backend (src/schema.gql).
 * Solo se piden los campos que el front realmente usa.
 */

export const FEED_QUERY = /* GraphQL */ `
  query Feed {
    posts {
      data {
        id_post
        title
        description
        fecha_publicacion
        id_usuario

        usuario {
          id_usuario
          nombre_usuario
          avatar
          descripcion
        }

        files {
          id_file
          dir
          file_extension
        }

        stats {
          likes
          comentarios
          shares
          favorites
        }
      }

      nextCursor
    }
  }
`;

export const SEARCH_POSTS_QUERY = /* GraphQL */ `
  query SearchPosts($filter: SearchPostInput!) {
    searchPosts(filter: $filter) {
      id_post
      title
      description
      fecha_publicacion
      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
      files {
        id_file
        dir
        file_extension
      }
    }
  }
`;

export const FIND_ONE_USER_QUERY = /* GraphQL */ `
  query FindOneUser($id_user: Float!) {
    findOneUser(id_user: $id_user) {
      id_usuario
      nombre_usuario
      email
      descripcion
      avatar
      fecha_registro
      is_admin
      insignias {
        id_insignia
        insignia {
          id_insignia
          nombre
          descripcion
          icono
        }
      }
      seguidores {
        follower_id
      }
      siguiendo {
        following_id
      }
      posts {
        id_post
        title
        description
        fecha_publicacion
        files {
          id_file
          dir
          file_extension
        }
      }
    }
  }
`;

export const FIND_FRIENDS_QUERY = /* GraphQL */ `
  query FindFriends {
    findFriends {
      id_usuario
      nombre_usuario
      avatar
      descripcion
    }
  }
`;

export const GET_PET_QUERY = /* GraphQL */ `
  query GetPet {
    getPet {
      id_mascota
      id_usuario
      nivel_actual
      puntos_experiencia
      fecha_ultima_evolucion
    }
  }
`;

export const GET_BADGES_QUERY = /* GraphQL */ `
  query GetBadges {
    getBadges {
      id_insignia
      nombre
      descripcion
      icono
    }
  }
`;

export const CREATE_POST_MUTATION = /* GraphQL */ `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id_post
      title
      description
      fecha_publicacion
    }
  }
`;

export const ADD_REACTION_MUTATION = /* GraphQL */ `
  mutation AddReaction($input: AddReaction!) {
    addReaction(input: $input) {
      id_postReaction
      id_post
      Like
      Favorites
      Share
      Comentario
    }
  }
`;

export const TOGGLE_FOLLOW_MUTATION = /* GraphQL */ `
  mutation ToggleFollow($id_user: Float!) {
    toggleFollow(id_user: $id_user) {
      following
      user {
        id_usuario
        nombre_usuario
      }
    }
  }
`;

export const CREATE_COMMENT_MUTATION = /* GraphQL */ `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id_comentario
      texto
      Fecha
      Usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const POST_COMMENTS_QUERY = /* GraphQL */ `
  query PostComments($postId: Float!) {
    getComment(postId: $postId) {
      id_comentario
      texto
      Fecha

      Usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;
