# API de Autenticación - Sistema de Asistencia Escolar

Documentación completa de los endpoints de autenticación para Staff y Preceptores.

---

## 📋 Tabla de Contenidos

- [Registro de Staff](#registro-de-staff)
- [Login de Staff](#login-de-staff)
- [Registro de Preceptor](#registro-de-preceptor)
- [Login de Preceptor](#login-de-preceptor)
- [Refresh Token](#refresh-token)
- [Logout](#logout)
- [Códigos de Estado](#códigos-de-estado)
- [Notas de Seguridad](#notas-de-seguridad)

---

## Registro de Staff

### `POST /api/v1/auth/staff`

Crea un nuevo usuario de tipo Staff en el sistema. El password se hashea con bcrypt antes de almacenarse. Genera una entrada de auditoría tras la creación exitosa.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "dni": "12345678",
  "password": "MiPassword123!",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "STAFF"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `dni` | string | ✅ Sí | DNI único del usuario (identificador principal) |
| `password` | string | ✅ Sí | Contraseña en texto plano (será hasheada) |
| `first_name` | string | ✅ Sí | Nombre del usuario |
| `last_name` | string | ✅ Sí | Apellido del usuario |
| `role` | string | ✅ Sí | Rol del usuario: `ADMIN`, `STAFF`, o `PRECEPTOR` |

#### Respuestas

##### ✅ 201 Created - Usuario creado exitosamente
```json
{
  "success": true,
  "message": "Usuario creado correctamente",
  "user": {
    "id": 42,
    "dni": "12345678",
    "role": "STAFF"
  }
}
```

##### ❌ 400 Bad Request - Datos incompletos o inválidos
```json
{
  "success": false,
  "message": "dni y password requeridos"
}
```

##### ❌ 400 Bad Request - DNI duplicado
```json
{
  "success": false,
  "message": "Error al crear el usuario"
}
```

#### Códigos de Estado
- `201` - Usuario creado correctamente
- `400` - Datos faltantes, inválidos o DNI ya existe
- `415` - Content-Type debe ser application/json

---

## Login de Staff

### `POST /api/v1/auth/staff/login`

Autentica un usuario Staff y genera tokens de acceso. Verifica DNI y contraseña, creando una sesión con access token JWT (válido 1 hora) y refresh token (válido 1 día).

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "dni": "12345678",
  "password": "MiPassword123!"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `dni` | string | ✅ Sí | DNI del usuario registrado |
| `password` | string | ✅ Sí | Contraseña en texto plano |

#### Respuestas

##### ✅ 200 OK - Login exitoso
```json
{
  "success": true,
  "message": "Inicio de sesion exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsImRuaSI6IjEyMzQ1Njc4Iiwicm9sZSI6IlNUQUZGIiwiaWF0IjoxNjk5OTk5OTk5fQ...",
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "refreshExpiresAt": "2025-11-12T10:00:00.000Z",
  "user": {
    "id": 42,
    "dni": "12345678",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "STAFF"
  }
}
```

##### ❌ 401 Unauthorized - Credenciales inválidas
```json
{
  "success": false,
  "message": "Error al iniciar sesion"
}
```

#### Códigos de Estado
- `200` - Login exitoso, tokens generados
- `401` - DNI no existe o contraseña incorrecta
- `415` - Content-Type debe ser application/json

#### Notas
- El `token` (access token) debe enviarse en el header `Authorization: Bearer <token>` para endpoints protegidos
- El `refreshToken` se usa para renovar el access token cuando expire
- Los tokens expiran según configuración del servidor (access: 1h, refresh: 1d)

---

## Registro de Preceptor

### `POST /api/v1/auth/preceptor`

Crea un nuevo usuario de tipo Preceptor en el sistema. Similar al registro de Staff pero sin campo `role` (asignado automáticamente como `PRECEPTOR`).

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "dni": "87654321",
  "password": "PreceptorPass456!",
  "first_name": "María",
  "last_name": "González"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `dni` | string | ✅ Sí | DNI único del preceptor |
| `password` | string | ✅ Sí | Contraseña en texto plano (será hasheada) |
| `first_name` | string | ✅ Sí | Nombre del preceptor |
| `last_name` | string | ✅ Sí | Apellido del preceptor |

#### Respuestas

##### ✅ 201 Created - Preceptor creado exitosamente
```json
{
  "success": true,
  "message": "Preceptor creado correctamente",
  "preceptor": {
    "id": "87654321",
    "username": "87654321"
  }
}
```

##### ❌ 400 Bad Request - Datos incompletos
```json
{
  "success": false,
  "message": "dni y password requeridos"
}
```

##### ❌ 400 Bad Request - DNI duplicado
```json
{
  "success": false,
  "message": "Error al crear el Preceptor"
}
```

#### Códigos de Estado
- `201` - Preceptor creado correctamente
- `400` - Datos faltantes, inválidos o DNI ya existe
- `415` - Content-Type debe ser application/json

---

## Login de Preceptor

### `POST /api/v1/auth/preceptor/login`

Autentica un usuario Preceptor y genera tokens de acceso. El proceso es idéntico al login de Staff pero el rol se fija automáticamente como `PRECEPTOR`.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "dni": "87654321",
  "password": "PreceptorPass456!"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `dni` | string | ✅ Sí | DNI del preceptor registrado |
| `password` | string | ✅ Sí | Contraseña en texto plano |

#### Respuestas

##### ✅ 200 OK - Login exitoso
```json
{
  "success": true,
  "message": "Inicio de sesion exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUsImRuaSI6Ijg3NjU0MzIxIiwicm9sZSI6IlBSRUNFUFRPUiIsImlhdCI6MTY5OTk5OTk5OX0...",
  "refreshToken": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
  "refreshExpiresAt": "2025-11-12T10:00:00.000Z",
  "preceptor": {
    "id": 25,
    "dni": "87654321"
  }
}
```

##### ❌ 401 Unauthorized - Credenciales inválidas
```json
{
  "success": false,
  "message": "Error al iniciar sesion"
}
```

#### Códigos de Estado
- `200` - Login exitoso, tokens generados
- `401` - DNI no existe o contraseña incorrecta
- `415` - Content-Type debe ser application/json

---

## Refresh Token

### `POST /api/v1/auth/refresh`

Renueva el access token usando un refresh token válido. Permite mantener la sesión sin requerir nuevo login.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `refreshToken` | string | ✅ Sí | Refresh token obtenido en el login |

#### Respuestas

##### ✅ 200 OK - Token renovado
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "refreshExpiresAt": "2025-11-13T10:00:00.000Z"
}
```

##### ❌ 400 Bad Request - Falta refresh token
```json
{
  "success": false,
  "message": "Falta refreshToken"
}
```

##### ❌ 401 Unauthorized - Token inválido o expirado
```json
{
  "success": false,
  "message": "Refresh token inválido o expirado"
}
```

#### Códigos de Estado
- `200` - Access token renovado exitosamente
- `400` - Falta el campo refreshToken
- `401` - Refresh token inválido, expirado o revocado

---

## Logout

### `POST /api/v1/auth/logout`

Revoca el refresh token para cerrar sesión de forma segura. El access token seguirá siendo válido hasta su expiración natural (1 hora), pero no podrá renovarse.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `refreshToken` | string | ❌ No | Refresh token a revocar (opcional) |

#### Respuestas

##### ✅ 200 OK - Logout exitoso
```json
{
  "success": true
}
```

#### Códigos de Estado
- `200` - Logout exitoso (siempre retorna 200, incluso si no hay token)

#### Notas
- Si no se proporciona `refreshToken`, el endpoint responde exitosamente sin acción
- El access token JWT seguirá válido hasta expirar (stateless)
- Para invalidar inmediatamente, implementar blacklist de tokens (no implementado actualmente)

---

## Códigos de Estado

### Resumen de Códigos HTTP

| Código | Significado | Uso en API Auth |
|--------|-------------|-----------------|
| `200` | OK | Login exitoso, refresh exitoso, logout |
| `201` | Created | Usuario/Preceptor creado exitosamente |
| `400` | Bad Request | Datos faltantes, inválidos o duplicados |
| `401` | Unauthorized | Credenciales incorrectas, token inválido |
| `415` | Unsupported Media Type | Content-Type no es application/json |

---

## Notas de Seguridad

### 🔐 Seguridad de Contraseñas
- Todas las contraseñas se hashean con **bcrypt** (10 rondas) antes de almacenarse
- Nunca se retornan contraseñas o hashes en las respuestas
- Las contraseñas en texto plano solo existen durante el request

### 🎫 Tokens JWT
- **Access Token**: JWT firmado con HS256 o RS256
  - Duración: 1 hora
  - Payload incluye: `id`, `dni`, `role`
  - Verificación automática en middleware `authRequired`
  
- **Refresh Token**: Token aleatorio de 64 caracteres hex almacenado en base de datos
  - Duración: 1 día (configurable con `REFRESH_TOKEN_TTL_SECONDS`)
  - Se almacena hasheado con SHA-256 en la base de datos (no en texto plano)
  - Puede revocarse explícitamente (logout)
  - Rotación automática: al renovar, el token viejo se revoca y se emite uno nuevo

### 🛡️ Middleware de Seguridad
- **Content-Type enforcement**: Solo acepta `application/json`
- **Input sanitization**: Limpia `<script>` tags y null bytes
- **Rate limiting**: 
  - **Global** (App Core en `app.js`): 1000 requests por IP cada 15 minutos (COMENTADO, no activo actualmente)
  - **Global** (App Auth en `auth_app.js`): 500 requests por IP cada 15 minutos ✅ ACTIVO
  - **Login específico** (App Auth): 20 intentos cada 10 minutos en `/api/v1/auth/*` ✅ ACTIVO
  - Protección contra ataques de fuerza bruta en endpoints de login

### 📝 Auditoría
- Todos los eventos de autenticación se registran en `AuditLog`:
  - `SIGNUP`: Creación de usuario
  - `LOGIN`: Inicio de sesión exitoso
  - `AUTH_REQUIRED_MISSING_TOKEN`: Intento sin token
  - `AUTH_TOKEN_INVALID`: Token inválido
  - `ACCESS_DENIED`: Denegación por rol insuficiente

---

## Variables de Entorno Relacionadas

```env
# JWT Configuration
JWT_SECRET=e0f9d7dab775a1ded80c37443535ed0980c6e2f0a7fc65198b27d454c489688332f8796ab850a504ecd4c7642a52f33ee9a03ebf88fda902006dca47eb63595f
JWT_ISSUER=asistencia-escolar-auth-service
JWT_AUDIENCE=asistencia-api

# Database
DATABASE_URL=postgresql://usuario:password@localhost:5432/asistencia_db
```

---

**Última actualización**: 11 de noviembre de 2025  
**Versión API**: v1
