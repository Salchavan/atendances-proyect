# API de Estudiantes - Sistema de Asistencia Escolar

Documentación completa de los endpoints para gestión de estudiantes, inscripciones y movimientos.

---

## 📋 Tabla de Contenidos

- [Estudiantes](#estudiantes)
  - [Listar Estudiantes](#listar-estudiantes)
  - [Obtener Estudiante](#obtener-estudiante)
  - [Crear Estudiante](#crear-estudiante)
  - [Actualizar Estudiante](#actualizar-estudiante)
  - [Eliminar Estudiante](#eliminar-estudiante)
- [Inscripciones](#inscripciones)
- [Retiros](#retiros)
- [Salidas Tempranas](#salidas-tempranas)

---

## Estudiantes

### Listar Estudiantes

#### `GET /api/v1/students`

Obtiene una lista paginada de estudiantes con filtros opcionales.

**Autenticación**: ✅ Requerida  
**Roles permitidos**: Todos los autenticados

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | number | ❌ No | Número de página (default: 1) |
| `pageSize` | number | ❌ No | Cantidad por página (default: 50, max: 200) |
| `q` | string | ❌ No | Búsqueda por nombre, apellido o username |
| `classroomId` | number | ❌ No | Filtrar por ID de aula |
| `active` | boolean | ❌ No | Filtrar por estado activo/inactivo |

#### Ejemplo de Request
```http
GET /api/v1/students?page=1&pageSize=20&q=juan&classroomId=5&active=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuestas

##### ✅ 200 OK - Estudiantes listados exitosamente
```json
{
  "success": true,
  "message": "Estudiantes listados con exito",
  "students": [
    {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "username": "jperez",
      "classroom_id": 5,
      "active": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "first_name": "María",
      "last_name": "González",
      "username": "mgonzalez",
      "classroom_id": 5,
      "active": true,
      "createdAt": "2025-01-16T11:30:00.000Z",
      "updatedAt": "2025-01-16T11:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

##### ❌ 400 Bad Request - Error en parámetros
```json
{
  "success": false,
  "message": "Error al listar los estudiantes",
  "error": "Parámetros inválidos"
}
```

##### ❌ 401 Unauthorized - Token faltante o inválido
```json
{
  "success": false,
  "message": "Token requerido"
}
```

#### Códigos de Estado
- `200` - Estudiantes listados correctamente
- `400` - Error en parámetros de consulta
- `401` - No autenticado

---

### Obtener Estudiante

#### `GET /api/v1/students/:id`

Obtiene la información detallada de un estudiante específico.

**Autenticación**: ✅ Requerida  
**Roles permitidos**: Todos los autenticados

#### Headers
```
Authorization: Bearer <token>
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del estudiante |

#### Ejemplo de Request
```http
GET /api/v1/students/42
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuestas

##### ✅ 200 OK - Estudiante encontrado
```json
{
  "success": true,
  "message": "Estudiante encontrado con exito",
  "student": {
    "id": 42,
    "first_name": "Juan",
    "last_name": "Pérez",
    "username": "jperez",
    "classroom_id": 5,
    "active": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

##### ❌ 404 Not Found - Estudiante no existe
```json
{
  "success": false,
  "message": "Error al obtener el estudiante",
  "error": "No existe el estudiante"
}
```

#### Códigos de Estado
- `200` - Estudiante encontrado
- `404` - Estudiante no existe
- `401` - No autenticado

---

### Crear Estudiante

#### `POST /api/v1/students`

Crea un nuevo estudiante en el sistema.

**Autenticación**: ✅ Requerida  
**Roles permitidos**: `ADMIN`, `PRECEPTOR`, `STAFF`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "username": "jperez",
  "classroomId": 5,
  "active": true
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `first_name` | string | ✅ Sí | Nombre del estudiante |
| `last_name` | string | ✅ Sí | Apellido del estudiante |
| `username` | string | ✅ Sí | Nombre y Apellido |
| `classroomId` | number | ✅ Sí | ID del aula a la que pertenece |
| `active` | boolean | ❌ No | Estado activo (default: true) |

#### Respuestas

##### ✅ 201 Created - Estudiante creado exitosamente
```json
{
  "success": true,
  "message": "Estudiante creado con exito",
  "student": {
    "id": 43,
    "first_name": "Juan",
    "last_name": "Pérez",
    "username": "jperez",
    "classroom_id": 5,
    "active": true,
    "createdAt": "2025-11-11T15:30:00.000Z",
    "updatedAt": "2025-11-11T15:30:00.000Z"
  }
}
```

##### ❌ 400 Bad Request - Datos incompletos
```json
{
  "success": false,
  "message": "Error al crear el estudiante",
  "error": "Datos incompletos"
}
```

##### ❌ 400 Bad Request - Username duplicado en el aula
```json
{
  "success": false,
  "message": "Error al crear el estudiante",
  "error": "Ya existe un estudiante con ese username en la clase"
}
```

##### ❌ 400 Bad Request - Aula no existe
```json
{
  "success": false,
  "message": "Error al crear el estudiante",
  "error": "La clase no existe"
}
```

##### ❌ 403 Forbidden - Sin permisos
```json
{
  "success": false,
  "message": "No autorizado"
}
```

#### Códigos de Estado
- `201` - Estudiante creado correctamente
- `400` - Datos faltantes, inválidos o duplicados
- `401` - No autenticado
- `403` - Sin permisos suficientes
- `415` - Content-Type debe ser application/json

#### Notas
- El `username` debe ser único dentro del mismo aula (no global)
- Se genera auditoría automática al crear
- El aula (`classroomId`) debe existir previamente

---

### Actualizar Estudiante

#### `PUT /api/v1/students/:id`

Actualiza la información de un estudiante existente.

**Autenticación**: ✅ Requerida  
**Roles permitidos**: `ADMIN`, `PRECEPTOR`, `STAFF`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del estudiante a actualizar |

#### Request Body
```json
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez García",
  "username": "jcperez",
  "classroomId": 6,
  "active": false
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `first_name` | string | ❌ No | Nuevo nombre |
| `last_name` | string | ❌ No | Nuevo apellido |
| `username` | string | ❌ No | Nuevo username |
| `classroomId` | number | ❌ No | Nuevo ID de aula |
| `active` | boolean | ❌ No | Nuevo estado |

#### Respuestas

##### ✅ 200 OK - Estudiante actualizado
```json
{
  "success": true,
  "message": "Estudiante actualizado con exito",
  "student": {
    "id": 43,
    "first_name": "Juan Carlos",
    "last_name": "Pérez García",
    "username": "jcperez",
    "classroom_id": 6,
    "active": false,
    "createdAt": "2025-11-11T15:30:00.000Z",
    "updatedAt": "2025-11-11T16:45:00.000Z"
  }
}
```

##### ❌ 400 Bad Request - Estudiante no existe
```json
{
  "success": false,
  "message": "Error al actualizar el estudiante",
  "error": "El estudiante no existe"
}
```

#### Códigos de Estado
- `200` - Estudiante actualizado correctamente
- `400` - Error en actualización
- `401` - No autenticado
- `403` - Sin permisos

---

### Eliminar Estudiante

#### `DELETE /api/v1/students/:id`

Elimina un estudiante del sistema.

**Autenticación**: ✅ Requerida  
**Roles permitidos**: `ADMIN`

#### Headers
```
Authorization: Bearer <token>
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del estudiante a eliminar |

#### Ejemplo de Request
```http
DELETE /api/v1/students/43
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuestas

##### ✅ 200 OK - Estudiante eliminado
```json
{
  "success": true,
  "message": "Estudiante eliminado con exito"
}
```

##### ❌ 400 Bad Request - No se puede eliminar
```json
{
  "success": false,
  "message": "No se puede eliminar el estudiante porque tiene registros de asistencia"
}
```

#### Códigos de Estado
- `200` - Estudiante eliminado correctamente
- `400` - Error al eliminar (dependencias)
- `401` - No autenticado
- `403` - Sin permisos (solo ADMIN)

#### Notas
- Solo usuarios con rol `ADMIN` pueden eliminar estudiantes
- No se puede eliminar si tiene registros de asistencia asociados
- Se genera auditoría automática

---

## Códigos de Estado Generales

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Operación exitosa (GET, PUT, DELETE) |
| `201` | Created | Recurso creado exitosamente (POST) |
| `400` | Bad Request | Datos faltantes, inválidos o conflictos |
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Sin permisos para la operación |
| `404` | Not Found | Recurso no encontrado |
| `415` | Unsupported Media Type | Content-Type no es application/json |

---

## Notas de Seguridad

### 🔐 Autenticación
- Todos los endpoints requieren token JWT válido
- Token debe enviarse en header: `Authorization: Bearer <token>`
- Token expira en 1 hora

### 👥 Roles y Permisos

| Endpoint | ADMIN | STAFF | PRECEPTOR |
|----------|-------|-------|-----------|
| GET /students | ✅ | ✅ | ✅ |
| GET /students/:id | ✅ | ✅ | ✅ |
| POST /students | ✅ | ✅ | ✅ |
| PUT /students/:id | ✅ | ✅ | ✅ |
| DELETE /students/:id | ✅ | ✅ | ❌ |

### 📝 Auditoría
Todas las operaciones de creación, actualización y eliminación se registran automáticamente en `AuditLog`.

---

**Última actualización**: 11 de noviembre de 2025  
**Versión API**: v1
