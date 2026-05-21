# API de Asistencia - Sistema de Asistencia Escolar

Documentación completa del módulo de asistencia, eventos de ausencia, reportes parciales y agregados anuales.

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Módulos](#módulos)
  - [Asistencias (Attendance)](#asistencias-attendance)
  - [Eventos de Ausencia](#eventos-de-ausencia)
  - [Reportes de Ausencias Parciales](#reportes-de-ausencias-parciales)
  - [Agregados Anuales](#agregados-anuales)

---

## Introducción

El módulo de asistencia gestiona el registro diario de asistencia de estudiantes, eventos especiales (llegadas tarde, salidas tempranas, justificaciones), y cálculos agregados de ausencias anuales.

**Conceptos clave:**
- **Attendance**: Registro base de asistencia por estudiante/día (estado: PRESENT, ABSENT, JUSTIFIED, WITHDRAWN)
- **AbsenceEvent**: Evento que modifica la fracción de ausencia (LATE_ARRIVAL, EARLY_EXIT, JUSTIFICATION, MANUAL_ADJUST)
- **Fracción**: Valor decimal que representa ausencias parciales (ej: 0.25 = 1/4 de falta)
- **Agregado Anual**: Suma de ausencias completas + fracciones acumuladas por estudiante/año

---

## Módulos

## Asistencias (Attendance)

### Base URL
`/api/v1/attendance`

---

### Listar Asistencias

#### `GET /api/v1/attendance`

Obtiene lista paginada de registros de asistencia con filtros opcionales.

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
| `studentId` / `idStudent` | number | ❌ No | Filtrar por estudiante | - |
| `classroomId` | number | ❌ No | Filtrar por aula | - |
| `status` | string | ❌ No | `PRESENT`, `ABSENT`, `JUSTIFIED`, `WITHDRAWN` | - |
| `from` | string | ❌ No | Fecha inicio (ISO 8601: `YYYY-MM-DD`) | - |
| `to` | string | ❌ No | Fecha fin (ISO 8601: `YYYY-MM-DD`) | - |
| `date` | string | ❌ No | Fecha exacta (equivale a `from` y `to` iguales) | - |

#### Ejemplo de Request
```http
GET /api/v1/attendance?studentId=42&from=2025-03-01&to=2025-03-31&page=1&pageSize=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1523,
      "student_id": 42,
      "classroom_id": 5,
      "date": "2025-03-15T00:00:00.000Z",
      "status": "PRESENT",
      "checkInTime": "2025-03-15T12:30:00.000Z",
      "checkOutTime": "2025-03-15T17:45:00.000Z",
      "fraction": 0,
      "absenceFraction": 0,
      "notes": null,
      "created_at": "2025-03-15T12:35:00.000Z",
      "updated_at": "2025-03-15T12:35:00.000Z"
    },
    {
      "id": 1524,
      "student_id": 42,
      "classroom_id": 5,
      "date": "2025-03-16T00:00:00.000Z",
      "status": "PRESENT",
      "checkInTime": "2025-03-16T12:45:00.000Z",
      "checkOutTime": "2025-03-16T17:30:00.000Z",
      "fraction": 0.25,
      "absenceFraction": 0.25,
      "notes": "Llegó tarde",
      "created_at": "2025-03-16T12:46:00.000Z",
      "updated_at": "2025-03-16T13:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45
  }
}
```

**Nota sobre campos**:
- **`fraction`**: Fracción base de ausencia para ese día (0 = completo, 0.25/0.5/0.75 = parcial)
- **`absenceFraction`**: Fracción acumulada tras aplicar eventos (puede ser negativa si hay justificaciones)
- **`status`**: Estado de asistencia (PRESENT, ABSENT, JUSTIFIED, WITHDRAWN)

#### Códigos de Estado
- `200` - Lista obtenida exitosamente
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Crear Asistencia

#### `POST /api/v1/attendance`

Crea un nuevo registro de asistencia para un estudiante en una fecha específica.

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
| `studentId` / `student_id` / `idStudent` | number | ✅ Sí | ID del estudiante |
| `classroomId` / `classroom_id` / `idClassroom` | number | ✅ Sí | ID del aula |
| `date` | string | ✅ Sí | Fecha (ISO 8601: `YYYY-MM-DD`) |
| `status` | string | ✅ Sí | `PRESENT`, `ABSENT`, `JUSTIFIED`, `WITHDRAWN` |
| `checkInTime` / `checkIn` | string | ❌ No | Hora de entrada (ISO 8601) |
| `checkOutTime` / `checkOut` | string | ❌ No | Hora de salida (ISO 8601) |
| `fraction` | number | ❌ No | Fracción de ausencia (0, 0.25, 0.5, 0.75, 1) | `0` |
| `notes` | string | ❌ No | Observaciones |

#### Ejemplo de Request
```json
{
  "studentId": 42,
  "classroomId": 5,
  "date": "2025-11-11",
  "status": "PRESENT",
  "checkInTime": "2025-11-11T12:30:00Z",
  "checkOutTime": "2025-11-11T17:45:00Z",
  "fraction": 0,
  "notes": null
}
```

#### Respuesta

##### ✅ 201 Created
```json
{
  "success": true,
  "message": "Asistencia creada",
  "attendance": {
    "id": 1525,
    "student_id": 42,
    "classroom_id": 5,
    "date": "2025-11-11T00:00:00.000Z",
    "status": "PRESENT",
    "checkInTime": "2025-11-11T12:30:00.000Z",
    "checkOutTime": "2025-11-11T17:45:00.000Z",
    "fraction": 0,
    "absenceFraction": 0,
    "notes": null,
    "created_at": "2025-11-11T12:35:00.000Z",
    "updated_at": "2025-11-11T12:35:00.000Z"
  }
}
```

##### ❌ 400 Bad Request
```json
{
  "success": false,
  "message": "Ya existe un registro de asistencia para este estudiante en esta fecha"
}
```

#### Códigos de Estado
- `201` - Asistencia creada exitosamente (genera auditoría)
- `400` - Datos inválidos o duplicado
- `401` - No autenticado
- `403` - Sin permisos (requiere ADMIN, PRECEPTOR o STAFF)

---

### Actualizar Asistencia

#### `PUT /api/v1/attendance/:id`

Actualiza un registro de asistencia existente.

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
| `id` | number | ID del registro de asistencia |

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `status` | string | ❌ No | `PRESENT`, `ABSENT`, `JUSTIFIED`, `WITHDRAWN` |
| `checkInTime` / `checkIn` | string | ❌ No | Hora de entrada (ISO 8601) |
| `checkOutTime` / `checkOut` | string | ❌ No | Hora de salida (ISO 8601) |
| `fraction` | number | ❌ No | Fracción de ausencia |
| `notes` | string | ❌ No | Observaciones |

#### Ejemplo de Request
```http
PUT /api/v1/attendance/1525
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "JUSTIFIED",
  "notes": "Justificado por certificado médico"
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Asistencia actualizada",
  "attendance": {
    "id": 1525,
    "student_id": 42,
    "classroom_id": 5,
    "date": "2025-11-11T00:00:00.000Z",
    "status": "JUSTIFIED",
    "checkInTime": "2025-11-11T12:30:00.000Z",
    "checkOutTime": "2025-11-11T17:45:00.000Z",
    "fraction": 0,
    "absenceFraction": 0,
    "notes": "Justificado por certificado médico",
    "created_at": "2025-11-11T12:35:00.000Z",
    "updated_at": "2025-11-11T14:20:00.000Z"
  }
}
```

#### Códigos de Estado
- `200` - Actualización exitosa (genera auditoría)
- `400` - Datos inválidos o registro no encontrado
- `401` - No autenticado
- `403` - Sin permisos

---

### Eliminar Asistencia

#### `DELETE /api/v1/attendance/:id`

Elimina un registro de asistencia.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, PRECEPTOR

#### Headers
```
Authorization: Bearer <token>
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del registro de asistencia |

#### Ejemplo de Request
```http
DELETE /api/v1/attendance/1525
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Asistencia eliminada"
}
```

##### ❌ 400 Bad Request
```json
{
  "success": false,
  "message": "Registro no encontrado"
}
```

#### Códigos de Estado
- `200` - Eliminación exitosa (genera auditoría)
- `400` - Registro no encontrado
- `401` - No autenticado
- `403` - Sin permisos (requiere ADMIN o PRECEPTOR)

---

## Eventos de Ausencia

### Base URL
`/api/v1/absence-events`

Los eventos de ausencia modifican la fracción de ausencia de un registro de asistencia existente.

---

### Listar Eventos de Ausencia

#### `GET /api/v1/absence-events`

Lista eventos de ausencia con filtros opcionales.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `studentId` | number | ❌ No | Filtrar por estudiante |
| `classroomId` | number | ❌ No | Filtrar por aula |
| `year` | number | ❌ No | Filtrar por año |
| `type` | string | ❌ No | `LATE_ARRIVAL`, `EARLY_EXIT`, `JUSTIFICATION`, `MANUAL_ADJUST` |
| `page` | number | ❌ No | Número de página |
| `pageSize` | number | ❌ No | Registros por página |

#### Ejemplo de Request
```http
GET /api/v1/absence-events?studentId=42&year=2025&type=LATE_ARRIVAL
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 301,
      "attendance_id": 1524,
      "type": "LATE_ARRIVAL",
      "fractionDelta": 0.25,
      "reason": null,
      "authorizedBy": null,
      "created_at": "2025-03-16T13:00:00.000Z"
    },
    {
      "id": 302,
      "attendance_id": 1530,
      "type": "EARLY_EXIT",
      "fractionDelta": 0.25,
      "reason": "Consulta médica",
      "authorizedBy": "Director",
      "created_at": "2025-03-20T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 12
  }
}
```

**Nota**:
- **`fractionDelta`**: Incremento/decremento de fracción (positivo suma ausencia, negativo descuenta)

#### Códigos de Estado
- `200` - Lista obtenida
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Registrar Llegada Tarde

#### `POST /api/v1/absence-events/late-arrival`

Registra una llegada tarde que incrementa la fracción de ausencia.

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
| `attendanceId` | number | ✅ Sí | ID del registro de asistencia |
| `checkInTime` | string | ✅ Si | Hora real de entrada (ISO 8601) |
| `fraction` | number | ❌ No | Fracción a sumar (default según lógica del sistema) |

#### Ejemplo de Request
```json
{
  "attendanceId": 1524,
  "checkInTime": "2025-03-16T12:45:00Z",
  "fraction": 0.25
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Llegada tarde registrada",
  "eventId": 301,
  "updatedAttendance": {
    "id": 1524,
    "absenceFraction": 0.25
  }
}
```

#### Códigos de Estado
- `200` - Evento creado (genera auditoría)
- `400` - Error en datos o asistencia no encontrada
- `401` - No autenticado
- `403` - Sin permisos

---

### Registrar Salida Temprana

#### `POST /api/v1/absence-events/early-exit`

Registra una salida anticipada que incrementa la fracción de ausencia.

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
| `attendanceId` | number | ✅ Sí | ID del registro de asistencia |
| `withdrawalTime` | string | ✅ Sí | Hora de retiro (ISO 8601) |
| `fraction` | number | ❌ No | Fracción a sumar |
| `reason` | string | ❌ No | Motivo del retiro |
| `authorizedBy` | string | ❌ No | Quién autorizó |

#### Ejemplo de Request
```json
{
  "attendanceId": 1530,
  "withdrawalTime": "2025-03-20T15:30:00Z",
  "fraction": 0.25,
  "reason": "Consulta médica",
  "authorizedBy": "Director"
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Salida anticipada registrada",
  "eventId": 302,
  "updatedAttendance": {
    "id": 1530,
    "absenceFraction": 0.25
  }
}
```

#### Códigos de Estado
- `200` - Evento creado (genera auditoría)
- `400` - Error en datos
- `401` - No autenticado
- `403` - Sin permisos

---

### Registrar Justificación

#### `POST /api/v1/absence-events/justification`

Registra una justificación que reduce la fracción de ausencia (valor negativo).

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
| `attendanceId` | number | ✅ Sí | ID del registro de asistencia |
| `fraction` | number | ❌ No | Fracción a descontar (negativo) |
| `reason` | string | ❌ No | Motivo de justificación |
| `authorizedBy` | string | ❌ No | Quién autorizó |

#### Ejemplo de Request
```json
{
  "attendanceId": 1524,
  "fraction": -0.25,
  "reason": "Certificado médico presentado",
  "authorizedBy": "Preceptor"
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Justificación registrada",
  "eventId": 303,
  "updatedAttendance": {
    "id": 1524,
    "absenceFraction": 0
  }
}
```

#### Códigos de Estado
- `200` - Evento creado (genera auditoría)
- `400` - Error en datos
- `401` - No autenticado
- `403` - Sin permisos

---

### Ajuste Manual de Ausencia

#### `POST /api/v1/absence-events/manual-adjust`

Aplica un ajuste manual positivo o negativo a la fracción de ausencia.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, STAFF

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `attendanceId` | number | ✅ Sí | ID del registro de asistencia |
| `fractionDelta` | number | ✅ Sí | Cambio en fracción (positivo o negativo) |
| `reason` | string | ❌ No | Motivo del ajuste |

#### Ejemplo de Request
```json
{
  "attendanceId": 1524,
  "fractionDelta": 0.5,
  "reason": "Corrección administrativa"
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Ajuste manual aplicado",
  "eventId": 304,
  "updatedAttendance": {
    "id": 1524,
    "absenceFraction": 0.5
  }
}
```

#### Códigos de Estado
- `200` - Ajuste aplicado (genera auditoría)
- `400` - Error en datos
- `401` - No autenticado
- `403` - Sin permisos (requiere ADMIN o STAFF)

---

### Recalcular Asistencia

#### `POST /api/v1/absence-events/recalc`

Recalcula la fracción de ausencia sumando todos los eventos asociados a una asistencia.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, STAFF

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `attendanceId` | number | ✅ Sí | ID del registro de asistencia |

#### Ejemplo de Request
```json
{
  "attendanceId": 1524
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Fracción recalculada",
  "attendance": {
    "id": 1524,
    "absenceFraction": 0.25
  }
}
```

#### Códigos de Estado
- `200` - Recálculo exitoso (genera auditoría)
- `400` - Error en datos
- `401` - No autenticado
- `403` - Sin permisos

---

### Eliminar Evento de Ausencia

#### `DELETE /api/v1/absence-events/:id`

Elimina un evento de ausencia y recalcula automáticamente la asistencia asociada.

**Autenticación**: ✅ Requerida  
**Roles**: ADMIN, STAFF

#### Headers
```
Authorization: Bearer <token>
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del evento de ausencia |

#### Ejemplo de Request
```http
DELETE /api/v1/absence-events/301
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "message": "Evento eliminado y asistencia recalculada"
}
```

#### Códigos de Estado
- `200` - Eliminación exitosa (genera auditoría)
- `400` - Evento no encontrado
- `401` - No autenticado
- `403` - Sin permisos

---

## Reportes de Ausencias Parciales

### Base URL
`/api/v1/partial-absence-report`

Genera reportes anuales de ausencias parciales acumuladas.

---

### Reporte de Estudiante

#### `GET /api/v1/partial-absence-report/student`

Obtiene el reporte anual de ausencias parciales de un estudiante.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `studentId` | number | ✅ Sí | ID del estudiante |
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```http
GET /api/v1/partial-absence-report/student?studentId=42&year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "studentId": 42,
  "year": 2025,
  "report": {
    "wholeAbsences": 3,
    "fractionalTotal": 1.75,
    "equivalentAbsences": 4.75,
    "details": {
      "lateArrivals": 5,
      "earlyExits": 2,
      "justifications": 1,
      "manualAdjusts": 0
    }
  }
}
```

**Nota**:
- **`equivalentAbsences`** = `wholeAbsences` + `fractionalTotal`

#### Códigos de Estado
- `200` - Reporte generado
- `400` - Parámetros faltantes
- `401` - No autenticado

---

### Reporte de Aula

#### `GET /api/v1/partial-absence-report/classroom`

Obtiene el reporte consolidado de un aula.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `classroomId` | number | ✅ Sí | ID del aula |
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```http
GET /api/v1/partial-absence-report/classroom?classroomId=5&year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "classroomId": 5,
  "year": 2025,
  "students": [
    {
      "studentId": 42,
      "name": "Juan Pérez",
      "wholeAbsences": 3,
      "fractionalTotal": 1.75,
      "equivalentAbsences": 4.75
    },
    {
      "studentId": 43,
      "name": "María González",
      "wholeAbsences": 1,
      "fractionalTotal": 0.5,
      "equivalentAbsences": 1.5
    }
  ]
}
```

#### Códigos de Estado
- `200` - Reporte generado
- `400` - Parámetros faltantes
- `401` - No autenticado

---

### Reporte de Escuela

#### `GET /api/v1/partial-absence-report/school`

Obtiene el reporte consolidado de toda la escuela.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```http
GET /api/v1/partial-absence-report/school?year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "year": 2025,
  "classrooms": [
    {
      "classroomId": 5,
      "name": "1° A - Mañana",
      "totalStudents": 25,
      "avgEquivalentAbsences": 3.2
    },
    {
      "classroomId": 6,
      "name": "1° B - Tarde",
      "totalStudents": 23,
      "avgEquivalentAbsences": 2.8
    }
  ]
}
```

#### Códigos de Estado
- `200` - Reporte generado
- `400` - Parámetros faltantes
- `401` - No autenticado

---

### Reporte de Múltiples Estudiantes

#### `POST /api/v1/partial-absence-report/students`

Obtiene reportes de múltiples estudiantes en una sola consulta.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `studentIds` | array | ✅ Sí | Array de IDs de estudiantes |
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```json
{
  "studentIds": [42, 43, 44, 45],
  "year": 2025
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "year": 2025,
  "students": [
    {
      "studentId": 42,
      "wholeAbsences": 3,
      "fractionalTotal": 1.75,
      "equivalentAbsences": 4.75
    },
    {
      "studentId": 43,
      "wholeAbsences": 1,
      "fractionalTotal": 0.5,
      "equivalentAbsences": 1.5
    }
  ]
}
```

#### Códigos de Estado
- `200` - Reportes generados
- `400` - Parámetros faltantes o inválidos
- `401` - No autenticado

---

## Agregados Anuales

### Base URL
`/api/v1/year-absence-aggregate`

Gestiona agregados anuales pre-calculados de ausencias por estudiante.

---

### Obtener Agregado Anual

#### `GET /api/v1/year-absence-aggregate/aggregate`

Obtiene el agregado anual de un estudiante.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `studentId` | number | ✅ Sí | ID del estudiante |
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```http
GET /api/v1/year-absence-aggregate/aggregate?studentId=42&year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "aggregate": {
    "student_id": 42,
    "year": 2025,
    "wholeAbsences": 3,
    "fractional": 1.75,
    "created_at": "2025-03-01T10:00:00.000Z",
    "updated_at": "2025-11-11T14:30:00.000Z"
  }
}
```

##### ⚠️ 200 OK (sin datos)
```json
{
  "success": true,
  "aggregate": null
}
```

#### Códigos de Estado
- `200` - Consulta exitosa (puede ser null si no existe)
- `400` - Parámetros faltantes
- `401` - No autenticado

---

### Obtener Equivalente Anual

#### `GET /api/v1/year-absence-aggregate/equivalent`

Calcula el equivalente total de ausencias (wholeAbsences + fractional).

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `studentId` | number | ✅ Sí | ID del estudiante |
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```http
GET /api/v1/year-absence-aggregate/equivalent?studentId=42&year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "equivalent": 4.75
}
```

#### Códigos de Estado
- `200` - Cálculo exitoso
- `400` - Parámetros faltantes
- `401` - No autenticado

---

### Recalcular Agregado Anual

#### `POST /api/v1/year-absence-aggregate/recompute`

Recalcula el agregado anual desde cero sumando todos los eventos del año.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `studentId` | number | ✅ Sí | ID del estudiante |
| `year` | number | ✅ Sí | Año académico |

#### Ejemplo de Request
```json
{
  "studentId": 42,
  "year": 2025
}
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "aggregate": {
    "student_id": 42,
    "year": 2025,
    "wholeAbsences": 3,
    "fractional": 1.75,
    "created_at": "2025-03-01T10:00:00.000Z",
    "updated_at": "2025-11-11T15:45:00.000Z"
  }
}
```

**Nota**: Este endpoint es útil cuando se sospecha de desalineación entre eventos y el agregado.

#### Códigos de Estado
- `200` - Recálculo exitoso
- `400` - Parámetros faltantes o error en proceso
- `401` - No autenticado

---

## Códigos de Estado Generales

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado |
| `400` | Bad Request | Parámetros inválidos o faltantes |
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Sin permisos para la operación |
| `500` | Internal Server Error | Error del servidor |

---

## Notas Técnicas

### Sistema de Fracciones
- **Fracción base** (`fraction`): Valor inicial asignado al crear asistencia
- **Fracción acumulada** (`absenceFraction`): Resultado de sumar todos los `fractionDelta` de eventos
- **Valores comunes**: 0 (completo), 0.25 (1/4), 0.5 (1/2), 0.75 (3/4), 1 (ausencia total)

### Flujo de Eventos
1. Se crea `Attendance` con `fraction` base
2. Se agregan `AbsenceEvent` con `fractionDelta` (positivo o negativo)
3. El sistema actualiza `absenceFraction` = `fraction` + Σ(`fractionDelta`)
4. El agregado anual suma todas las fracciones del año

### Auditoría
- Todas las mutaciones (CREATE, UPDATE, DELETE) generan registros en `AuditLog`
- Los eventos incluyen metadata sobre `attendanceId` y tipo de evento
- El recálculo se audita con action `RECALC`

### Unicidad
- `Attendance`: único por `(student_id, date)`
- `StudentYearAbsenceAggregate`: único por `(student_id, year)`

---

**Última actualización**: 11 de noviembre de 2025  
**Versión API**: v1
