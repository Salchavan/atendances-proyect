# API de Inscripciones - Sistema de Asistencia Escolar

Documentación completa del módulo de inscripciones de estudiantes en aulas.

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Endpoints](#endpoints)
  - [Listar Inscripciones](#listar-inscripciones)
  - [Crear Inscripción](#crear-inscripción)
  - [Finalizar Inscripción](#finalizar-inscripción)
  - [Transferir Estudiante](#transferir-estudiante)

---

## Introducción

El módulo de inscripciones gestiona el historial académico de estudiantes, controlando su asignación a aulas a lo largo del tiempo. Es fundamental para validar operaciones de asistencia y mantener integridad de datos.

**Conceptos clave:**
- **Inscripción Activa**: Registro sin `endDate` o con `endDate` futuro
- **Validación de Asistencia**: Solo se permite registrar asistencia si existe inscripción activa en el aula
- **Historial Académico**: Mantiene registro completo de movimientos entre aulas
- **Transferencias**: Proceso que cierra inscripción actual y crea nueva automáticamente

**Tipos de inscripción** (campo `reason`):
- `INITIAL` - Primera inscripción del estudiante
- `TRANSFER` - Transferencia desde otra aula
- `PROMOTION` - Promoción al siguiente año/grado
- `CONTINUATION` - Continuación en la misma aula
- `READMISSION` - Readmisión tras una salida

---

## Endpoints

### Base URL
`/api/v1/enrollments`

---

### Listar Inscripciones

#### `GET /api/v1/enrollments`

Obtiene lista paginada de inscripciones con filtros opcionales.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `page` | number | ❌ No | Número de página | `1` |
| `pageSize` | number | ❌ No | Registros por página | `50` |
| `studentId` | number | ❌ No | Filtrar por estudiante | - |
| `classroomId` | number | ❌ No | Filtrar por aula | - |
| `activeOnly` | boolean | ❌ No | Solo inscripciones activas (`true`/`false`) | `false` |

#### Ejemplo de Request
```http
GET /api/v1/enrollments?studentId=11&activeOnly=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "message": "Inscripciones listadas",
  "success": true,
  "enrollments": [
    {
      "id": 6,
      "student_id": 11,
      "classroom_id": 11,
      "startDate": "2025-09-29T12:56:17.242Z",
      "endDate": null,
      "reason": "INITIAL",
      "promotedFromEnrollmentId": null
    },
    {
      "id": 7,
      "student_id": 11,
      "classroom_id": 12,
      "startDate": "2025-03-01T00:00:00.000Z",
      "endDate": "2025-08-31T00:00:00.000Z",
      "reason": "TRANSFER",
      "promotedFromEnrollmentId": 6
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "pageSize": 50
  }
}
```

**Nota sobre campos**:
- **`endDate`**: `null` indica inscripción activa, fecha indica cuándo finalizó
- **`reason`**: Motivo de la inscripción (ver tipos arriba)
- **`promotedFromEnrollmentId`**: ID de inscripción anterior en caso de transferencia/promoción

#### Códigos de Estado
- `200` - Lista obtenida exitosamente
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Crear Inscripción

#### `POST /api/v1/enrollments`

Crea una nueva inscripción de estudiante en un aula.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, PRECEPTOR, STAFF

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `studentId` | number | ✅ Sí | ID del estudiante |
| `classroomId` | number | ✅ Sí | ID del aula |
| `startDate` | string | ✅ Sí | Fecha de inicio (ISO 8601: `YYYY-MM-DD`) |
| `endDate` | string | ❌ No | Fecha de fin (ISO 8601: `YYYY-MM-DD`) - omitir para inscripción permanente |

#### Ejemplo de Request
```json
{
  "studentId": 13,
  "classroomId": 7,
  "startDate": "2025-11-19"
}
```

#### Respuesta

##### ✅ 201 Created
```json
{
  "message": "Inscripción creada",
  "success": true,
  "enrollment": {
    "id": 8,
    "student_id": 13,
    "classroom_id": 7,
    "startDate": "2025-11-19T00:00:00.000Z",
    "endDate": null,
    "reason": null,
    "promotedFromEnrollmentId": null
  }
}
```

##### ❌ 400 Bad Request
```json
{
  "message": "Ya existe una inscripción activa o solapada",
  "success": false
}
```

#### Códigos de Estado
- `201` - Inscripción creada exitosamente (genera auditoría)
- `400` - Datos incompletos, estudiante/aula inexistente, o inscripción solapada
- `401` - No autenticado
- `403` - Sin permisos (requiere ADMIN, PRECEPTOR o STAFF)

**Validaciones importantes:**
- No puede haber inscripciones solapadas para el mismo estudiante
- El estudiante y aula deben existir en la base de datos
- Si se especifica `endDate`, debe ser posterior a `startDate`

---

### Finalizar Inscripción

#### `POST /api/v1/enrollments/:id/end`

Finaliza una inscripción activa estableciendo una fecha de fin.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, PRECEPTOR, STAFF

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID de la inscripción |

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `endDate` | string | ✅ Sí | Fecha de finalización (ISO 8601: `YYYY-MM-DD`) |

#### Ejemplo de Request
```http
POST /api/v1/enrollments/8/end
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "endDate": "2025-12-31"
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "message": "Inscripción finalizada",
  "success": true,
  "enrollment": {
    "id": 8,
    "student_id": 13,
    "classroom_id": 7,
    "startDate": "2025-11-19T00:00:00.000Z",
    "endDate": "2025-12-31T00:00:00.000Z",
    "reason": null,
    "promotedFromEnrollmentId": null
  }
}
```

##### ❌ 400 Bad Request
```json
{
  "message": "La inscripción ya está finalizada",
  "success": false
}
```

#### Códigos de Estado
- `200` - Inscripción finalizada exitosamente (genera auditoría)
- `400` - Datos incompletos, inscripción inexistente, ya finalizada, o fecha inválida
- `401` - No autenticado
- `403` - Sin permisos

**Validaciones importantes:**
- La inscripción debe existir y estar activa (`endDate` debe ser `null`)
- La `endDate` no puede ser anterior a `startDate`
- Una vez finalizada, no se puede volver a activar (crear nueva inscripción)

---

### Transferir Estudiante

#### `POST /api/v1/enrollments/transfer`

Transfiere un estudiante de su aula actual a una nueva aula. Automáticamente cierra la inscripción actual y crea una nueva.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, PRECEPTOR, STAFF

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `studentId` | number | ✅ Sí | ID del estudiante |
| `toClassroomId` | number | ✅ Sí | ID del aula destino |
| `effectiveDate` | string | ✅ Sí | Fecha efectiva del cambio (ISO 8601: `YYYY-MM-DD`) |
| `reason` | string | ❌ No | Motivo de la transferencia |

#### Ejemplo de Request
```json
{
  "studentId": 13,
  "toClassroomId": 8,
  "effectiveDate": "2025-12-01",
  "reason": "Cambio de turno solicitado por padres"
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "previous": {
    "id": 8,
    "student_id": 13,
    "classroom_id": 7,
    "startDate": "2025-11-19T00:00:00.000Z",
    "endDate": "2025-12-01T00:00:00.000Z",
    "reason": null,
    "promotedFromEnrollmentId": null
  },
  "current": {
    "id": 9,
    "student_id": 13,
    "classroom_id": 8,
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": null,
    "reason": "TRANSFER",
    "promotedFromEnrollmentId": 8
  }
}
```

##### ❌ 400 Bad Request
```json
{
  "success": false,
  "message": "No hay inscripción activa para transferir"
}
```

#### Códigos de Estado
- `200` - Transferencia exitosa (genera auditoría)
- `400` - Estudiante sin inscripción activa, aula destino inexistente, ya está en esa aula, fecha inválida
- `401` - No autenticado
- `403` - Sin permisos

**Validaciones importantes:**
- El estudiante debe tener una inscripción activa
- El aula destino debe existir y ser diferente a la actual
- La fecha efectiva no puede ser anterior al inicio de la inscripción actual
- No se puede transferir si el año académico está cerrado

**Proceso automático:**
1. Valida que el estudiante tenga inscripción activa
2. Cierra la inscripción actual con `endDate = effectiveDate`
3. Crea nueva inscripción desde `effectiveDate` con `reason = "TRANSFER"`
4. Actualiza el cache de `classroom_id` en el registro del estudiante
5. Vincula ambas inscripciones mediante `promotedFromEnrollmentId`

---

## Códigos de Estado Generales

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Operación exitosa |
| `201` | Created | Inscripción creada |
| `400` | Bad Request | Parámetros inválidos, datos faltantes, o violación de reglas de negocio |
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Sin permisos para la operación |
| `500` | Internal Server Error | Error del servidor |

---

## Notas Técnicas

### Inscripción Activa
Una inscripción se considera **activa** cuando:
- `endDate` es `null` (sin fecha de finalización), O
- `endDate` es mayor a la fecha actual

### Validación de Asistencia
El sistema **requiere** inscripción activa antes de permitir:
- Crear registros de asistencia (`POST /api/v1/attendance`)
- Crear eventos de ausencia
- Generar reportes de estudiante

### Prevención de Solapamientos
No se permiten inscripciones solapadas para el mismo estudiante:
- Dos inscripciones activas simultáneas
- Rangos de fechas que se superponen

### Historial y Auditoría
- Todas las mutaciones generan registros en `AuditLog`
- Las transferencias mantienen vínculo con `promotedFromEnrollmentId`
- El campo `reason` documenta el motivo de cada inscripción

### Integridad Referencial
- Valida existencia de `studentId` y `classroomId`
- Mantiene cache de `classroom_id` actualizado en tabla `Student`
- Respeta restricciones de años académicos cerrados

---

## Casos de Uso Comunes

### Inscripción Inicial de Estudiante
```json
POST /api/v1/enrollments
{
  "studentId": 15,
  "classroomId": 5,
  "startDate": "2025-03-01"
}
```

### Consultar Inscripción Activa
```http
GET /api/v1/enrollments?studentId=15&activeOnly=true
```

### Finalizar Año Lectivo
```json
POST /api/v1/enrollments/10/end
{
  "endDate": "2025-12-15"
}
```

### Cambio de Turno/División
```json
POST /api/v1/enrollments/transfer
{
  "studentId": 15,
  "toClassroomId": 6,
  "effectiveDate": "2025-08-01",
  "reason": "Cambio de turno"
}
```

---

## Relación con Otros Módulos

### Con Asistencias
- **Prerequisito**: Inscripción activa requerida para crear asistencia
- **Validación**: `classroomId` debe coincidir entre inscripción y asistencia

### Con Estudiantes
- **Cache**: Mantiene `classroom_id` actualizado en tabla Student
- **Integridad**: Valida existencia del estudiante antes de inscribir

### Con Aulas
- **Validación**: Verifica que el aula exista y esté disponible
- **Reportes**: Agrupa estudiantes por aula para reportes consolidados

---

**Última actualización**: 19 de noviembre de 2025  
**Versión API**: v1