import { gql } from "@apollo/client";

/* ================================================= */
/* POSTS
/* ================================================= */

export const FEED_QUERY = gql`
  query Feed {
    posts {
      data {
        id_post
        title
        description
        fecha_publicacion
        id_usuario
        score

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

        reactions {
          id_postReaction
          id_usuario
          like
          favorites
          share
          comentario
        }

        comentarios {
          id_comentario
          texto
          fecha
          id_comentario_padre

          usuario {
            id_usuario
            nombre_usuario
            avatar
          }
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

/* ================================================= */
/* COMMENTS
/* ================================================= */

export const REPLIES_QUERY = gql`
  query GetCommentReplies($commentId: Float!) {
    getCommentReplies {
      id_comentario
      texto
      fecha
      id_comentario_padre

      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const SEARCH_POSTS_QUERY = gql`
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

export const POST_COMMENTS_QUERY = gql`
  query PostComments($postId: Float!) {
    getComment(postId: $postId) {
      id_comentario
      texto
      fecha
      id_comentario_padre

      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

/* ================================================= */
/* USER
/* ================================================= */

export const FIND_ONE_USER_QUERY = gql`
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

export const FIND_FRIENDS_QUERY = gql`
  query FindFriends {
    findFriends {
      id_usuario
      nombre_usuario
      avatar
      descripcion
    }
  }
`;

/* ================================================= */
/* PET / BADGES
/* ================================================= */

export const GET_PET_QUERY = gql`
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

export const GET_BADGES_QUERY = gql`
  query GetBadges {
    getBadges {
      id_insignia
      nombre
      descripcion
      icono
    }
  }
`;

/* ================================================= */
/* POSTS MUTATIONS
/* ================================================= */

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id_post
      title
      description
      fecha_publicacion
    }
  }
`;

export const ADD_REACTION_MUTATION = gql`
  mutation AddReaction($input: AddReaction!) {
    addReaction(input: $input) {
      id_postReaction
      id_post
      like
      favorites
      share
      comentario
    }
  }
`;

/* ================================================= */
/* FOLLOW
/* ================================================= */

export const TOGGLE_FOLLOW_MUTATION = gql`
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

/* ================================================= */
/* COMMENTS MUTATIONS
/* ================================================= */

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id_comentario
      texto
      fecha
      id_comentario_padre

      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id_comentario
      texto
      id_comentario_padre

      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($comment_id: Float!) {
    deleteComment(comment_id: $comment_id) {
      id_comentario
    }
  }
`;

export const ADD_COMMENT_REACTION_MUTATION = gql`
  mutation AddReactions($input: AddReactions!) {
    addReactions(input: $input) {
      id_reaction
      id_comment
      id_usuario
      like
      share
      commented
    }
  }
`;

/* ================================================= */
/* COMMENTS SUBSCRIPTIONS
/* ================================================= */

export const NEW_COMMENT_SUBSCRIPTION = gql`
  subscription NewComment {
    newComment {
      id_comentario
      id_post
      texto
      fecha
      id_comentario_padre

      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const UPDATED_COMMENT_SUBSCRIPTION = gql`
  subscription UpdatedComment {
    updatedComment {
      id_comentario
      texto
      id_comentario_padre

      usuario {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const DELETED_COMMENT_SUBSCRIPTION = gql`
  subscription DeletedComment {
    deletedComment {
      id_comentario
    }
  }
`;

export const COMMENT_REACTION_SUBSCRIPTION = gql`
  subscription CommentReactionUpdated($commentId: Float!) {
    commentReactionUpdated(commentId: $commentId) {
      id_reaction
      id_comment
      id_usuario
      like
      share
      commented
    }
  }
`;

/* ================================================= */
/* USER MUTATIONS
/* ================================================= */

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUser!) {
    updateUser(input: $input) {
      id_usuario
      nombre_usuario
      email
      descripcion
      avatar
    }
  }
`;

export const UPDATED_USER_SUBSCRIPTION = gql`
  subscription UpdatedUser {
    updatedUser {
      id_usuario
      nombre_usuario
      email
      descripcion
      avatar
    }
  }
`;

/* ================================================= */
/* CHAT
/* ================================================= */

export const GET_MESSAGES_QUERY = gql`
  query GetMessages($input: SearchMessageDto!) {
    getMessages(input: $input) {
      id_mensaje
      texto
      fecha
      editado
      leido

      id_usuario_envia
      id_usuario_recibe

      envia {
        id_usuario
        nombre_usuario
        avatar
      }

      recibe {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const CREATE_MESSAGE_MUTATION = gql`
  mutation CreateMessage($input: CreateMessage!) {
    createMessage(input: $input) {
      id_mensaje
      texto
      fecha
      editado
      leido

      id_usuario_envia
      id_usuario_recibe

      envia {
        id_usuario
        nombre_usuario
        avatar
      }

      recibe {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const DELETE_MESSAGE_MUTATION = gql`
  mutation RemoveMessage($input: DeleteMessage!) {
    removeMessage(input: $input) {
      id_mensaje
    }
  }
`;

export const UPDATE_MESSAGE_MUTATION = gql`
  mutation UpdateMessage($input: UpdateMessage!) {
    updateMessage(input: $input) {
      id_mensaje
      texto
      editado
    }
  }
`;

/* ================================================= */
/* CHAT SUBSCRIPTIONS
/* ================================================= */

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage {
    newMessage {
      id_mensaje
      texto
      fecha
      editado
      leido

      id_usuario_envia
      id_usuario_recibe

      envia {
        id_usuario
        nombre_usuario
        avatar
      }

      recibe {
        id_usuario
        nombre_usuario
        avatar
      }
    }
  }
`;

export const UPDATE_MESSAGE_SUBSCRIPTION = gql`
  subscription UpdatedMessage {
    updatedMessage {
      id_mensaje
      texto
      editado
      fecha
    }
  }
`;

export const DELETE_MESSAGE_SUBSCRIPTION = gql`
  subscription DeleteMessage {
    deleteMessage {
      id_mensaje
    }
  }
`;
