# Variables de Entorno para pato-backend

Este documento lista las variables de entorno que el backend lee directamente del código fuente. También indica dónde se usan y cómo configurarlas correctamente.

## Cómo se carga el `.env`
- `src/app.module.ts` usa `ConfigModule.forRoot()`.
- Por defecto, NestJS carga el archivo `.env` ubicado en la raíz del proyecto.
- Si no hay `.env`, el backend usará las variables del entorno del sistema.

## Variables requeridas

### `DATABASE_URL`
- Uso: Conexión de Prisma a la base de datos SQLite.
- Forma esperada: `file:./dev.db`
- Código:
  - `src/prisma/prisma.service.ts`
  - `prisma.config.ts`
- Nota: esta variable es obligatoria para que Prisma abra la base de datos.

### `JWT_SECRET`
- Uso: Firma y verificación del access token JWT.
- Código:
  - `src/auth/auth.module.ts`
  - `src/auth/auth.service.ts`
  - `src/auth/strateggies/jwt.strateggy.ts`
- Función: se usa para validar sesiones de usuario y para proteger rutas GraphQL/REST.

### `JWT_REFRESH_SECRET`
- Uso: Firma y verificación del refresh token JWT.
- Código:
  - `src/auth/auth.service.ts`
- Función:
  - validar refresh tokens en `validateRefreshToken`
  - generar refresh tokens en `generateAuthTokens`
  - cerrar sesión en `logout`

### `JWT_EXPIRES_IN`
- Uso declarado: expiración del access token en `JwtModule.register`.
- Código:
  - `src/auth/auth.module.ts`
- Crucial: el método `generateAuthTokens()` actualmente genera el access token con `expiresIn: '15m'` de forma explícita, por lo que esta variable no se está aplicando en el flujo actual.

### `PORT`
- Uso: Puerto donde se inicia el servidor NestJS.
- Código: `src/main.ts`
- Valor por defecto: `3000` si no se define.

## Ejemplo de `.env`
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_secreto_de_acceso"
JWT_REFRESH_SECRET="tu_secreto_de_refresh"
JWT_EXPIRES_IN="15m"
PORT=3000
```

## Observaciones importantes
- No se usa `JWT_REFRESH_TOKEN` en el código. El nombre correcto es `JWT_REFRESH_SECRET`.
- `DATABASE_URL` debe apuntar a un archivo SQLite válido, normalmente `file:./dev.db`.
- Asegúrate de usar valores fuertes y únicos para `JWT_SECRET` y `JWT_REFRESH_SECRET`.
- En producción, guarda estas variables en un lugar seguro y no las subas al repositorio.

## Resumen rápido
- `DATABASE_URL`: URL de la base de datos Prisma/SQLite.
- `JWT_SECRET`: firma/verifica el access token.
- `JWT_REFRESH_SECRET`: firma/verifica el refresh token.
- `JWT_EXPIRES_IN`: variable declarada en el módulo JWT, pero el access token se genera explícitamente con `15m` en el código actual.
- `PORT`: puerto en el que se levanta el servidor.

## Consumo recomendado para frontend

### Autenticación REST

#### Login
- Endpoint: `POST /auth/login`
- Body JSON:
  ```json
  {
    "nombre_usuario": "usuario",
    "contraseña": "tu_contraseña"
  }
  ```
- Devuelve: `{ ok: true }` y guarda cookies `access_token` y `refresh_token`.

#### Renovar tokens
- Endpoint: `POST /auth/refresh`
- No envía body.
- Usa la cookie `refresh_token` y devuelve `{ ok: true }` con cookies renovadas.

#### Obtener sesión
- Endpoint: `GET /auth/me`
- No envía body.
- Usa la cookie `access_token` para devolver datos del usuario.

#### Logout
- Endpoint: `POST /auth/logout`
- No envía body.
- Borra las cookies `access_token` y `refresh_token`.

#### Registro local
- Endpoint: `POST /auth/register`
- Body JSON:
  ```json
  {
    "nombre_usuario": "usuario",
    "contraseña": "tu_contraseña",
    "contraseña_repetida": "tu_contraseña"
  }
  ```

#### Registro OAuth
- Endpoint: `POST /auth/registerAuth`
- Body JSON:
  ```json
  {
    "username": "usuario",
    "provider": "google",
    "provider_id": "identificador_del_proveedor"
  }
  ```

#### Login OAuth
- Endpoint: `POST /auth/oAuthLogin`
- Body JSON:
  ```json
  {
    "provider": "google",
    "provider_id": "identificador_del_proveedor"
  }
  ```

### Ejemplo de llamadas REST con fetch
```js
await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre_usuario: 'usuario', contraseña: 'pass' }),
});

await fetch('http://localhost:3000/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});

await fetch('http://localhost:3000/auth/me', {
  method: 'GET',
  credentials: 'include',
});
```

### GraphQL
- Endpoint: `POST /graphql`
- Autenticación: usa cookies `access_token` y `refresh_token`.
- Debes enviar `credentials: 'include'` en el fetch.

#### Query de posts
```js
await fetch('http://localhost:3000/graphql', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query { posts { id_post title description fecha_publicacion usuario { id_usuario nombre_usuario } } }`,
  }),
});
```

#### Query de búsqueda de posts
```js
await fetch('http://localhost:3000/graphql', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query SearchPosts($filter: SearchPostInput!) { searchPosts(filter: $filter) { id_post title description } }`,
    variables: {
      filter: { username: "usuario", title: "hola" }
    },
  }),
});
```

#### Otras consultas útiles
- `findFriends` para obtener usuarios seguidos.
- `findOneUser(id_user: Int)` para un perfil.
- `getBadges` para insignias.
- `getPet` para el estado de la mascota.
- `getMessages(input: SearchMessageDto!)` para mensajes.

### Notas de uso
- Para GraphQL, el header debe ser `Content-Type: application/json`.
- Siempre usa `credentials: 'include'` para que las cookies de sesión se envíen correctamente.
- En producción, habilita HTTPS y cambia `secure: true` en las cookies.
