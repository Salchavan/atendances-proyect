# Arquitectura del Backend - Sistema de Asistencia Escolar

## Introducción General

El Sistema de Asistencia Escolar está construido sobre una arquitectura backend moderna basada en **Node.js** con **Express.js 5**, implementando el patrón **Modelo-Vista-Controlador (MVC)** de manera distribuida. Esta arquitectura está específicamente diseñada para manejar operaciones de asistencia escolar, gestión de estudiantes, personal administrativo y reportes analíticos de manera escalable y segura.

La aplicación utiliza **ES Modules** (importaciones nativas de JavaScript) en lugar del sistema CommonJS tradicional, lo que proporciona mejor rendimiento, compatibilidad moderna y una sintaxis más limpia. Todo el código está estructurado siguiendo principios SOLID y buenas prácticas de desarrollo, con una separación clara de responsabilidades entre capas.

## Arquitectura de Aplicaciones Duales

### Diseño de Dual-App

El sistema implementa una arquitectura de **aplicaciones duales** que separa las responsabilidades en dos servidores independientes pero coordinados:

#### Aplicación Principal (Core App)
- **Puerto**: 3000
- **Archivo principal**: `index.js` → `app.js`
- **Responsabilidad**: Operaciones de negocio principales
- **Endpoints**: Asistencias, estudiantes, estadísticas, reportes, administración
- **Alcance**: Toda la lógica operativa del sistema escolar

#### Aplicación de Autenticación (Auth App)
- **Puerto**: 3001  
- **Archivo principal**: `auth_index.js` → `auth_app.js`
- **Responsabilidad**: Gestión de autenticación y autorización
- **Endpoints**: Login, signup, refresh tokens, JWKS
- **Alcance**: Exclusivamente operaciones de seguridad y sesiones

### Ventajas de la Separación

Esta arquitectura dual proporciona múltiples beneficios:

1. **Escalabilidad Independiente**: Cada aplicación puede escalarse según sus necesidades específicas
2. **Seguridad Mejorada**: El servicio de autenticación está aislado y puede tener configuraciones de seguridad más estrictas
3. **Mantenimiento Simplificado**: Los cambios en lógica de negocio no afectan la autenticación y viceversa
4. **Microservicios Preparado**: Base sólida para evolucionar hacia una arquitectura de microservicios
5. **Disponibilidad**: Si una app falla, la otra puede continuar operando

## Patrón MVC Distribuido

### Filosofía del Modelo-Vista-Controlador

El sistema implementa el patrón MVC de manera distribuida, donde:

- **Modelo**: Representado por los servicios y la capa de persistencia (Prisma ORM)
- **Vista**: APIs REST que devuelven JSON (sin renderizado de vistas tradicionales)
- **Controlador**: Middlewares y controladores que orquestan el flujo de datos

### Estructura de Capas

```
┌─────────────────────────────────────┐
│           RUTAS (Routes)            │
│     ┌─────────────────────────┐     │
│     │     MIDDLEWARES         │     │
│     │   ┌─────────────────┐   │     │
│     │   │ CONTROLADORES   │   │     │
│     │   │   ┌─────────┐   │   │     │
│     │   │   │SERVICIOS│   │   │     │
│     │   │   │   ┌─┐   │   │   │     │
│     │   │   │   │M│   │   │   │     │
│     │   │   │   │O│   │   │   │     │
│     │   │   │   │D│   │   │   │     │
│     │   │   │   │E│   │   │   │     │
│     │   │   │   │L│   │   │   │     │
│     │   │   │   │O│   │   │   │     │
│     │   │   │   └─┘   │   │   │     │
│     │   │   └─────────┘   │   │     │
│     │   └─────────────────┘   │     │
│     └─────────────────────────┘     │
└─────────────────────────────────────┘
```

## Capa de Rutas (Routes Layer)

### Propósito y Responsabilidades

Las rutas actúan como la **interfaz de entrada** del sistema, definiendo los endpoints públicos y orquestando el flujo de ejecución. Cada archivo de rutas es responsable de:

1. **Definición de Endpoints**: Mapeo de URLs a funciones controladoras
2. **Aplicación de Middlewares**: Autenticación, autorización, validaciones
3. **Manejo de Parámetros**: Extracción de path params, query strings y body
4. **Configuración de Métodos HTTP**: GET, POST, PUT, DELETE

### Estructura de Archivos de Rutas

Cada módulo funcional tiene su propio archivo de rutas siguiendo el patrón:

```javascript
// Ejemplo: src/routes/attendance_routes.js
import express from 'express'
import { authRequired, requireRoles } from '../middlewares/auth.js'
import { 
  listAttendances, 
  createAttendanceCtrl, 
  updateAttendanceCtrl, 
  deleteAttendanceCtrl 
} from '../controllers/attendance_controller.js'

const router = express.Router()

// Listado (todos los roles autenticados)
router.get('/', authRequired, listAttendances)

// Creación (roles específicos)
router.post('/', authRequired, requireRoles('ADMIN','PRECEPTOR','STAFF'), createAttendanceCtrl)

// Actualización (roles específicos)
router.put('/:id', authRequired, requireRoles('ADMIN','PRECEPTOR','STAFF'), updateAttendanceCtrl)

// Eliminación (roles más restrictivos)
router.delete('/:id', authRequired, requireRoles('ADMIN','PRECEPTOR'), deleteAttendanceCtrl)

export default router
```

### Montaje de Rutas

Las rutas se montan en las aplicaciones principales siguiendo una estructura jerárquica clara:

```javascript
// En app.js
const apiBase = '/api/v1'

app.use(`${apiBase}/attendance`, attendanceRoutes)
app.use(`${apiBase}/students`, studentRoutes)
app.use(`${apiBase}/enrollments`, enrollmentRoutes)
app.use(`${apiBase}/stats`, statsRoutes)
// ... más rutas
```

### Convenciones de Nomenclatura

- **Archivos**: `{entidad}_routes.js` (snake_case)
- **Variables del router**: `router` (consistente)
- **Exportación**: `export default router`
- **URLs base**: Plurales en inglés (`/students`, `/enrollments`)
- **Endpoints RESTful**: Siguiendo convenciones REST estándar

## Capa de Middlewares

### Arquitectura de Middlewares

Los middlewares actúan como **interceptores** en el pipeline de procesamiento, ejecutándose secuencialmente antes de llegar a los controladores. Implementan funcionalidades transversales que afectan múltiples endpoints.

### Middleware de Autenticación (`auth.js`)

```javascript
export const authRequired = async (req, res, next) => {
  try {
    // Extracción del token JWT desde headers
    const token = extractTokenFromHeaders(req)
    
    // Verificación y decodificación del token
    const payload = await verifyToken(token)
    
    // Inyección de datos del usuario en el request
    req.user = payload
    
    next() // Continuar al siguiente middleware/controlador
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    })
  }
}

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Sin permisos para esta operación'
      })
    }
    
    next()
  }
}
```

### Middleware de Correlación (`correlation.js`)

Implementa **trazabilidad de requests** para debugging y logging:

```javascript
export const correlationId = (req, res, next) => {
  // Generación o extracción de ID único para el request
  const corrId = req.headers['x-correlation-id'] || generateUUID()
  
  // Inyección en el request para uso posterior
  req.correlationId = corrId
  
  // Propagación en headers de respuesta
  res.setHeader('X-Correlation-Id', corrId)
  
  next()
}
```

### Middleware de Seguridad (`security.js`)

Implementa múltiples capas de protección:

```javascript
export const enforceJson = (req, res, next) => {
  // Forzar Content-Type application/json para POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type debe ser application/json'
      })
    }
  }
  next()
}

export const sanitizeInput = (req, res, next) => {
  // Limpieza de scripts maliciosos y null bytes
  function sanitize(obj) {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/\0/g, '')
    }
    // Recursión para objetos anidados
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key])
      })
    }
    return obj
  }
  
  req.body = sanitize(req.body)
  req.query = sanitize(req.query)
  next()
}
```

## Capa de Controladores

### Filosofía de los Controladores

Los controladores actúan como **orquestadores** del flujo de negocio, siendo responsables de:

1. **Extracción de Parámetros**: Desde URL, query strings y request body
2. **Normalización de Datos**: Conversión de tipos y alias de campos
3. **Invocación de Servicios**: Llamadas a la lógica de negocio
4. **Manejo de Respuestas**: Formateo y envío de respuestas HTTP
5. **Gestión de Auditoría**: Registro de operaciones para trazabilidad

### Estructura Típica de un Controlador

```javascript
// Ejemplo: src/controllers/attendance_controller.js
import { listAttendance, createAttendance, updateAttendance } from '../services/attendance_service.js'
import { audit } from '../utils/audit.js'

export const listAttendances = async (req, res) => {
  try {
    // 1. Extracción y normalización de parámetros
    const { page, pageSize, studentId, idStudent, classroomId, status, from, to, date } = req.query || {}
    
    // 2. Conversión de tipos (query params son siempre strings)
    const params = {
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      studentId: studentId || idStudent ? Number(studentId || idStudent) : undefined,
      classroomId: classroomId ? Number(classroomId) : undefined,
      status,
      from: from || date,
      to: to || date
    }
    
    // 3. Invocación del servicio
    const result = await listAttendance({ where: params })
    
    // 4. Respuesta HTTP
    res.status(result.success ? 200 : 400).json(result)
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      correlationId: req.correlationId
    })
  }
}

export const createAttendanceCtrl = async (req, res) => {
  try {
    const body = req.body || {}
    
    // Normalización de aliases (flexibilidad en nombres de campos)
    const data = {
      studentId: body.student_id ?? body.idStudent ?? body.studentId,
      classroomId: body.classroom_id ?? body.idClassroom ?? body.classroomId,
      date: body.date,
      status: body.status,
      checkInTime: body.checkInTime ?? body.checkIn,
      checkOutTime: body.checkOutTime ?? body.checkOut,
      fraction: body.fraction,
      notes: body.notes
    }
    
    // Invocación del servicio
    const result = await createAttendance({ data })
    
    // Auditoría (solo en operaciones exitosas)
    if (result.success && result.attendance) {
      await audit(req, {
        action: 'CREATE',
        entity: 'Attendance',
        entityId: result.attendance.id,
        after: result.attendance
      })
    }
    
    res.status(result.success ? 201 : 400).json(result)
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      correlationId: req.correlationId
    })
  }
}
```

### Patrones de Alias de Campos

Para mejorar la experiencia del desarrollador, los controladores aceptan múltiples variantes de nombres de campos:

```javascript
// Estos tres son equivalentes:
{ studentId: 42 }
{ student_id: 42 }
{ idStudent: 42 }

// Estos dos son equivalentes:
{ checkInTime: "2025-11-19T08:00:00Z" }
{ checkIn: "2025-11-19T08:00:00Z" }
```

### Manejo de Errores en Controladores

Los controladores implementan manejo de errores en múltiples niveles:

1. **Try-Catch Global**: Captura errores no manejados
2. **Validación de Servicios**: Los servicios devuelven objetos `{ success, ... }`
3. **Códigos HTTP Semánticos**: 200, 201, 400, 401, 403, 500
4. **Correlation IDs**: Para trazabilidad en logs

## Capa de Servicios

### Arquitectura de la Lógica de Negocio

Los servicios contienen la **lógica de negocio pura**, independiente de HTTP y frameworks. Implementan las reglas del dominio escolar y mantienen la integridad de datos.

### Principios de Diseño de Servicios

1. **Independencia de HTTP**: No conocen requests ni responses
2. **Respuestas Consistentes**: Siempre devuelven `{ success, message, ...data }`
3. **Validaciones de Negocio**: Implementan todas las reglas del dominio
4. **Transaccionalidad**: Manejan operaciones atómicas con Prisma
5. **Reutilización**: Pueden ser llamados desde múltiples controladores

### Estructura de un Servicio Completo

```javascript
// Ejemplo: src/services/attendance_service.js
import prisma from '../prismaClient.js'
import { Prisma } from '@prisma/client'
import { 
  requireFields, 
  clampFraction, 
  sanitizeString, 
  toDayRange, 
  paginateParams 
} from './service_utils.js'
import { getActiveEnrollment } from './enrollment_movement_service.js'
import { assertMutableRecord } from './immutability_service.js'

export const createAttendance = async ({ data }) => {
  try {
    // 1. Validación de campos requeridos
    const { studentId, classroomId, date, status } = data || {}
    requireFields(
      { studentId, classroomId, date }, 
      ['studentId', 'classroomId', 'date'], 
      'createAttendance'
    )
    
    // 2. Sanitización y normalización
    const fraction = clampFraction(data.fraction) // Limita entre 0 y 1
    const notes = sanitizeString(data.notes, { max: 500 })
    
    // 3. Validaciones de existencia
    const [student, classroom] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, select: { id: true } }),
      prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } })
    ])
    
    if (!student || !classroom) {
      throw new Error('Estudiante o aula inexistente')
    }
    
    // 4. Validación de unicidad (prevenir duplicados)
    const dayRange = toDayRange(date)
    const existing = await prisma.attendance.findFirst({
      where: { 
        student_id: studentId, 
        classroom_id: classroomId,
        date: { gte: dayRange.start, lte: dayRange.end }
      }
    })
    
    if (existing) {
      return { 
        message: 'Ya existe asistencia para ese estudiante en ese día', 
        success: true, 
        attendance: existing, 
        duplicate: true 
      }
    }
    
    // 5. Validación de inscripción activa (regla de negocio crítica)
    const activeEnrollment = await getActiveEnrollment(studentId)
    if (!activeEnrollment || activeEnrollment.classroom_id !== classroomId) {
      throw new Error('Estudiante no inscripto activamente en el aula indicada')
    }
    
    // 6. Validación de rango de fechas de inscripción
    const attendanceDate = new Date(date)
    if (activeEnrollment.startDate > attendanceDate) {
      throw new Error('Fecha de asistencia anterior al inicio de la inscripción')
    }
    if (activeEnrollment.endDate && attendanceDate > activeEnrollment.endDate) {
      throw new Error('Fecha de asistencia posterior al fin de la inscripción')
    }
    
    // 7. Creación del registro
    const attendance = await prisma.attendance.create({
      data: {
        student: { connect: { id: studentId } },
        classroom: { connect: { id: classroomId } },
        date: new Date(date),
        status: status ?? 'PRESENT',
        checkInTime: data.checkInTime ?? null,
        checkOutTime: data.checkOutTime ?? null,
        fraction: fraction,
        notes: notes
      }
    })
    
    // 8. Respuesta exitosa
    return { 
      message: 'Asistencia creada', 
      success: true, 
      attendance 
    }
    
  } catch (error) {
    // 9. Manejo específico de errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Violación de constraint único
      try {
        const dayRange = toDayRange(data.date)
        const existing = await prisma.attendance.findFirst({
          where: { 
            student_id: data.studentId, 
            date: { gte: dayRange.start, lte: dayRange.end } 
          }
        })
        if (existing) {
          return { 
            message: 'Asistencia ya existía', 
            success: true, 
            attendance: existing, 
            duplicate: true 
          }
        }
      } catch {}
      
      return { 
        message: 'Asistencia duplicada', 
        success: false, 
        error: 'UNIQUE_CONFLICT' 
      }
    }
    
    // 10. Respuesta de error genérica
    return { 
      message: 'Error al crear asistencia', 
      success: false, 
      error: error.message 
    }
  }
}
```

### Servicios de Utilidades (`service_utils.js`)

Contiene funciones reutilizables para validaciones y transformaciones comunes:

```javascript
export const requireFields = (data, fields, context) => {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new Error(`${context}: Faltan campos requeridos: ${missing.join(', ')}`)
  }
}

export const clampFraction = (value) => {
  if (value === null || value === undefined) return 0
  return Math.max(0, Math.min(1, Number(value)))
}

export const sanitizeString = (str, options = {}) => {
  if (!str) return null
  const { max = 1000 } = options
  return String(str).slice(0, max).trim()
}

export const toDayRange = (dateInput) => {
  const date = new Date(dateInput)
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  return { start, end }
}

export const paginateParams = ({ page = 1, pageSize = 50 }) => {
  const p = Math.max(1, Number(page))
  const ps = Math.max(1, Math.min(100, Number(pageSize)))
  return {
    page: p,
    pageSize: ps,
    skip: (p - 1) * ps,
    take: ps
  }
}
```

### Servicios Especializados

#### Servicio de Inmutabilidad (`immutability_service.js`)

Gestiona el bloqueo de registros y cierre de años académicos:

```javascript
export async function assertMutableRecord(entityName, record) {
  if (!record) return
  
  // Verificar bloqueo manual
  if (record.locked_at) {
    throw new Error(`${entityName} bloqueado`)
  }
  
  // Verificar año académico cerrado
  let dateValue = null
  if (entityName === 'Attendance') dateValue = record.date
  
  if (dateValue) {
    const year = extractYear(dateValue)
    if (await isYearClosed(year)) {
      throw new Error(`${entityName} pertenece a año cerrado`)
    }
  }
}
```

#### Servicio de Auditoría (`log_service.js`)

Registra todas las operaciones para trazabilidad y cumplimiento:

```javascript
export const logAudit = async ({ data }) => {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        entityExtra: data.entityExtra,
        userId: data.userId,
        before: data.before ? JSON.stringify(data.before) : null,
        after: data.after ? JSON.stringify(data.after) : null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date()
      }
    })
  } catch (error) {
    // Auditoría no debe fallar el proceso principal
    console.warn('Fallo en auditoría:', error.message)
  }
}
```

## Capa de Persistencia (Modelo)

### Prisma ORM como Abstracción

El sistema utiliza **Prisma** como ORM (Object-Relational Mapping), proporcionando:

1. **Type Safety**: Tipos TypeScript generados automáticamente
2. **Query Builder**: Sintaxis fluida para consultas complejas
3. **Migraciones**: Versionado de esquema de base de datos
4. **Conexiones**: Pool de conexiones optimizado
5. **Transacciones**: Soporte para operaciones atómicas

### Configuración de Prisma (`prismaClient.js`)

```javascript
import { PrismaClient } from '@prisma/client'

// Configuración del cliente con optimizaciones
const prisma = new PrismaClient({
  log: process.env.LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty'
})

// Middleware para auditoría automática
prisma.$use(async (params, next) => {
  // Interceptar operaciones de escritura para auditoría
  if (['create', 'update', 'delete'].includes(params.action)) {
    const result = await next(params)
    
    // Registrar en auditoría (implementación específica por modelo)
    await logModelChange(params.model, params.action, result)
    
    return result
  }
  
  return next(params)
})

export default prisma
```

### Esquema de Base de Datos

El esquema Prisma define las entidades del dominio escolar:

```prisma
// Ejemplo parcial del esquema
model Student {
  id           Int      @id @default(autoincrement())
  first_name   String   @db.VarChar(100)
  last_name    String   @db.VarChar(100)
  dni          String   @unique @db.VarChar(20)
  username     String   @unique @db.VarChar(50)
  classroom_id Int?     // Cache del aula actual
  active       Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  // Relaciones
  classroom    Classroom? @relation(fields: [classroom_id], references: [id])
  enrollments  StudentEnrollment[]
  attendances  Attendance[]
  exits        StudentExit[]

  @@index([classroom_id])
  @@index([active])
  @@map("students")
}

model Attendance {
  id              Int      @id @default(autoincrement())
  student_id      Int
  classroom_id    Int
  date            DateTime @db.Date
  status          AttendanceStatus @default(PRESENT)
  checkInTime     DateTime?
  checkOutTime    DateTime?
  fraction        Float    @default(0) @db.Real
  absenceFraction Float    @default(0) @db.Real
  notes           String?  @db.VarChar(500)
  locked_at       DateTime?
  locked_reason   String?  @db.VarChar(100)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Relaciones
  student         Student    @relation(fields: [student_id], references: [id])
  classroom       Classroom  @relation(fields: [classroom_id], references: [id])
  absenceEvents   AbsenceEvent[]
  withdrawals     Withdrawal[]

  // Índices para performance
  @@unique([student_id, date])
  @@index([classroom_id, date])
  @@index([date])
  @@index([status])
  @@map("attendances")
}
```

### Patrones de Consulta Optimizada

Los servicios implementan patrones de consulta eficientes:

```javascript
// Consulta con joins optimizados
export const getStudentAttendanceWithDetails = async (studentId, dateRange) => {
  return await prisma.attendance.findMany({
    where: {
      student_id: studentId,
      date: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    include: {
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          dni: true
        }
      },
      classroom: {
        select: {
          id: true,
          year: { select: { label: true } },
          division: { select: { name: true } },
          shift: true
        }
      },
      absenceEvents: {
        select: {
          id: true,
          type: true,
          fractionDelta: true,
          reason: true,
          created_at: true
        },
        orderBy: { created_at: 'asc' }
      }
    },
    orderBy: { date: 'desc' }
  })
}

// Agregaciones complejas para estadísticas
export const getClassroomAttendanceStats = async (classroomId, year) => {
  return await prisma.attendance.aggregate({
    where: {
      classroom_id: classroomId,
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      }
    },
    _count: {
      id: true
    },
    _avg: {
      fraction: true,
      absenceFraction: true
    },
    _sum: {
      fraction: true,
      absenceFraction: true
    }
  })
}
```

## Seguridad y Autenticación

### Sistema JWT Dual

El sistema implementa **JSON Web Tokens** con estrategia dual:

#### Access Tokens
- **Duración**: 1 hora
- **Uso**: Autenticación en operaciones
- **Almacenamiento**: Memoria/localStorage del cliente
- **Contenido**: ID usuario, rol, permisos

#### Refresh Tokens
- **Duración**: 24 horas (configurable)
- **Uso**: Renovación de access tokens
- **Almacenamiento**: HttpOnly cookies
- **Rotación**: Nuevo refresh token en cada renovación

### Configuración de JWT

```javascript
// Configuración flexible de algoritmos
const JWT_CONFIG = {
  algorithm: process.env.JWT_ALGORITHM || 'HS256', // HS256 o RS256
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '1d'
}

// Soporte para claves asimétricas (RS256)
const getSigningKey = () => {
  if (JWT_CONFIG.algorithm === 'RS256') {
    return {
      private: fs.readFileSync('backend/secrets/jwt_private.pem'),
      public: fs.readFileSync('backend/secrets/jwt_public.pem')
    }
  }
  return { secret: process.env.JWT_SECRET }
}
```

### Middleware de Autorización Granular

```javascript
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role
    
    // Verificación de rol
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Sin permisos para esta operación',
        correlationId: req.correlationId
      })
    }
    
    // Verificación adicional por contexto
    if (req.user.role === 'PRECEPTOR') {
      // Los preceptores solo pueden acceder a sus aulas asignadas
      const allowedClassrooms = req.user.assignedClassrooms || []
      const requestedClassroom = req.params.classroomId || req.body.classroomId
      
      if (requestedClassroom && !allowedClassrooms.includes(requestedClassroom)) {
        return res.status(403).json({
          success: false,
          message: 'Sin permisos para esta aula'
        })
      }
    }
    
    next()
  }
}
```

### Rate Limiting y Protección

```javascript
import rateLimit from 'express-rate-limit'

// Rate limiting global
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por IP
  message: {
    success: false,
    message: 'Demasiadas peticiones, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiting específico para login
export const loginRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 intentos por IP
  message: {
    success: false,
    message: 'Demasiados intentos de login'
  },
  skipSuccessfulRequests: true
})
```

## Sistema de Auditoría y Logging

### Auditoría Automática

Todas las operaciones de escritura generan registros de auditoría:

```javascript
export const audit = async (req, auditData) => {
  try {
    const auditEntry = {
      action: auditData.action, // CREATE, UPDATE, DELETE, etc.
      entity: auditData.entity, // Attendance, Student, etc.
      entityId: auditData.entityId,
      entityExtra: auditData.entityExtra,
      userId: req.user?.id,
      before: auditData.before ? JSON.stringify(auditData.before) : null,
      after: auditData.after ? JSON.stringify(auditData.after) : null,
      metadata: auditData.metadata ? JSON.stringify(auditData.metadata) : null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId,
      timestamp: new Date()
    }
    
    await prisma.auditLog.create({ data: auditEntry })
  } catch (error) {
    // La auditoría nunca debe fallar la operación principal
    console.warn(`[AUDIT FAIL] ${error.message}`, {
      correlationId: req.correlationId,
      entity: auditData.entity,
      action: auditData.action
    })
  }
}
```

### Logging Estructurado

```javascript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'attendance-system'
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
})

// Logging contextual en operaciones críticas
export const logOperation = (context, operation, metadata = {}) => {
  logger.info('Operation executed', {
    context,
    operation,
    correlationId: metadata.correlationId,
    userId: metadata.userId,
    duration: metadata.duration,
    success: metadata.success
  })
}
```

## Validaciones de Integridad y Reglas de Negocio

### Sistema de Inscripciones

Una de las reglas de negocio más importantes es la validación de inscripciones activas:

```javascript
export const validateActiveEnrollment = async (studentId, classroomId, date) => {
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      student_id: studentId,
      classroom_id: classroomId,
      startDate: { lte: new Date(date) },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date(date) } }
      ]
    }
  })
  
  if (!enrollment) {
    throw new Error('Estudiante no inscripto activamente en el aula')
  }
  
  return enrollment
}
```

### Sistema de Fracciones de Ausencia

Implementa lógica compleja para cálculo de ausencias parciales:

```javascript
export const calculateAbsenceFraction = async (attendanceId) => {
  // Obtener todos los eventos de ausencia para esta asistencia
  const events = await prisma.absenceEvent.findMany({
    where: { attendance_id: attendanceId },
    orderBy: { created_at: 'asc' }
  })
  
  // Obtener fracción base de la asistencia
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId }
  })
  
  // Calcular fracción total: base + suma de deltas
  const totalDelta = events.reduce((sum, event) => sum + event.fractionDelta, 0)
  const finalFraction = Math.max(0, Math.min(1, attendance.fraction + totalDelta))
  
  return {
    baseFraction: attendance.fraction,
    eventsDelta: totalDelta,
    finalFraction: finalFraction,
    eventsCount: events.length
  }
}
```

### Sistema de Años Académicos e Inmutabilidad

Previene modificaciones en períodos cerrados:

```javascript
export const assertMutablePeriod = async (date) => {
  const year = new Date(date).getFullYear()
  
  const academicYear = await prisma.academicYear.findUnique({
    where: { year }
  })
  
  if (academicYear?.closedAt) {
    throw new Error(`Año académico ${year} está cerrado para modificaciones`)
  }
  
  return true
}
```

## Performance y Optimización

### Índices de Base de Datos

El esquema implementa índices estratégicos para consultas frecuentes:

```prisma
model Attendance {
  // Índices para consultas comunes
  @@unique([student_id, date]) // Prevenir duplicados
  @@index([classroom_id, date]) // Reportes por aula/período
  @@index([date]) // Consultas por fecha
  @@index([status]) // Filtros por estado
  @@index([student_id]) // Historial por estudiante
}
```

### Paginación Eficiente

```javascript
export const paginateResults = async (model, where, options = {}) => {
  const { page = 1, pageSize = 50, orderBy = { id: 'desc' } } = options
  
  const take = Math.min(100, Math.max(1, Number(pageSize)))
  const skip = (Math.max(1, Number(page)) - 1) * take
  
  const [results, total] = await Promise.all([
    prisma[model].findMany({
      where,
      orderBy,
      skip,
      take,
      ...options.include && { include: options.include }
    }),
    prisma[model].count({ where })
  ])
  
  return {
    data: results,
    pagination: {
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      total,
      pages: Math.ceil(total / take)
    }
  }
}
```

### Cache de Datos Frecuentes

```javascript
import NodeCache from 'node-cache'

// Cache para datos que cambian poco
const dataCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verificar cada minuto
  useClones: false
})

export const getCachedClassrooms = async () => {
  const cacheKey = 'active_classrooms'
  
  let classrooms = dataCache.get(cacheKey)
  if (!classrooms) {
    classrooms = await prisma.classroom.findMany({
      where: { active: true },
      include: {
        year: { select: { label: true } },
        division: { select: { name: true } }
      },
      orderBy: [
        { year_id: 'asc' },
        { division_id: 'asc' },
        { shift: 'asc' }
      ]
    })
    
    dataCache.set(cacheKey, classrooms)
  }
  
  return classrooms
}
```

## Manejo de Errores y Resilencia

### Estrategia de Manejo de Errores

El sistema implementa manejo de errores en múltiples capas:

```javascript
// Error personalizado para reglas de negocio
export class BusinessRuleError extends Error {
  constructor(message, code = 'BUSINESS_RULE_VIOLATION') {
    super(message)
    this.name = 'BusinessRuleError'
    this.code = code
    this.statusCode = 400
  }
}

// Error para recursos no encontrados
export class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} con ID ${id} no encontrado`)
    this.name = 'NotFoundError'
    this.statusCode = 404
  }
}

// Middleware global de manejo de errores
export const errorHandler = (error, req, res, next) => {
  const correlationId = req.correlationId
  
  // Log del error para debugging
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    correlationId,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  })
  
  // Respuesta según tipo de error
  if (error instanceof BusinessRuleError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      correlationId
    })
  }
  
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message,
      correlationId
    })
  }
  
  // Error genérico (no exponer detalles internos)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    correlationId
  })
}
```

### Transacciones y Consistencia

```javascript
export const transferStudentWithHistory = async (transferData) => {
  return await prisma.$transaction(async (tx) => {
    try {
      // 1. Validar inscripción actual
      const currentEnrollment = await tx.studentEnrollment.findFirst({
        where: { 
          student_id: transferData.studentId, 
          endDate: null 
        }
      })
      
      if (!currentEnrollment) {
        throw new BusinessRuleError('No hay inscripción activa para transferir')
      }
      
      // 2. Cerrar inscripción actual
      const closedEnrollment = await tx.studentEnrollment.update({
        where: { id: currentEnrollment.id },
        data: { endDate: new Date(transferData.effectiveDate) }
      })
      
      // 3. Crear nueva inscripción
      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          student_id: transferData.studentId,
          classroom_id: transferData.toClassroomId,
          startDate: new Date(transferData.effectiveDate),
          reason: 'TRANSFER',
          promotedFromEnrollmentId: currentEnrollment.id
        }
      })
      
      // 4. Actualizar cache en student
      await tx.student.update({
        where: { id: transferData.studentId },
        data: { classroom_id: transferData.toClassroomId }
      })
      
      return {
        previous: closedEnrollment,
        current: newEnrollment
      }
      
    } catch (error) {
      // La transacción se revierte automáticamente
      throw error
    }
  })
}
```

## Configuración y Variables de Entorno

### Sistema de Configuración

```javascript
// config/environment.js
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Servidor
  PORT: process.env.PORT || 3000,
  AUTH_PORT: process.env.AUTH_PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Base de datos
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '1h',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '1d',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // CORS (si está habilitado)
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || [],
  
  // Features flags
  ENABLE_AUDIT: process.env.ENABLE_AUDIT !== 'false',
  ENABLE_CACHE: process.env.ENABLE_CACHE !== 'false'
}
```

## Testing y Calidad de Código

### Estructura de Tests

```javascript
// tests/services/attendance_service.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createAttendance } from '../src/services/attendance_service.js'
import { setupTestDb, cleanupTestDb } from './helpers/db.js'

describe('Attendance Service', () => {
  beforeEach(async () => {
    await setupTestDb()
  })
  
  afterEach(async () => {
    await cleanupTestDb()
  })
  
  describe('createAttendance', () => {
    it('should create attendance for enrolled student', async () => {
      // Arrange
      const testData = {
        studentId: 1,
        classroomId: 1,
        date: '2025-11-19',
        status: 'PRESENT'
      }
      
      // Act
      const result = await createAttendance({ data: testData })
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.attendance).toBeDefined()
      expect(result.attendance.student_id).toBe(1)
    })
    
    it('should reject attendance for non-enrolled student', async () => {
      // Arrange
      const testData = {
        studentId: 999, // No existe
        classroomId: 1,
        date: '2025-11-19',
        status: 'PRESENT'
      }
      
      // Act
      const result = await createAttendance({ data: testData })
      
      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('no inscripto')
    })
  })
})
```

## Deployment y DevOps

### Scripts de NPM

```json
{
  "scripts": {
    "start": "node index.js",
    "start:auth": "node auth_index.js",
    "start:both": "concurrently \"npm run start\" \"npm run start:auth\"",
    "dev": "nodemon index.js",
    "dev:auth": "nodemon auth_index.js",
    "dev:both": "concurrently \"npm run dev\" \"npm run dev:auth\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "jwt:show": "node scripts/show_jwt_keys.js",
    "jwt:rotate": "node scripts/rotate_jwt_keys.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

### Health Checks

```javascript
// Health check endpoints para monitoreo
export const healthCheck = async (req, res) => {
  try {
    // Verificar conexión a base de datos
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart
    
    // Verificar cache si está habilitado
    let cacheStatus = 'disabled'
    if (config.ENABLE_CACHE) {
      cacheStatus = dataCache.keys().length > 0 ? 'active' : 'empty'
    }
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      environment: config.NODE_ENV,
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      cache: {
        status: cacheStatus
      },
      uptime: process.uptime()
    })
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
```

## Sistema de Biometría y Reconocimiento

### Arquitectura del Sistema Biométrico

El sistema de asistencia escolar incluye un módulo avanzado de biometría que permite la identificación automática de estudiantes mediante reconocimiento facial y huella dactilar. Esta funcionalidad está diseñada para mejorar la precisión del registro de asistencia y eliminar la posibilidad de fraude o suplantación.

#### Componentes del Sistema

```javascript
// Estructura del sistema biométrico
const biometricSystem = {
  // Captura de datos biométricos
  capture: {
    facial: 'OpenCV + dlib',
    fingerprint: 'SDK fabricante',
    liveness: 'Detección anti-spoofing'
  },
  
  // Procesamiento y extracción de características
  processing: {
    faceEncoding: 'FaceNet embeddings',
    fingerprintTemplate: 'Minutiae points',
    qualityAssessment: 'NIST standards'
  },
  
  // Almacenamiento seguro
  storage: {
    templates: 'Encrypted database',
    images: 'Optional retention',
    metadata: 'Audit trails'
  },
  
  // Matching y verificación
  matching: {
    threshold: 'Configurable similarity',
    speed: 'Sub-second response',
    fallback: 'Manual verification'
  }
}
```

### Integración con Dispositivos

```javascript
// src/services/biometric_service.js
import { BiometricDevice } from '../integrations/biometric_devices.js'
import { FaceRecognition } from '../ai/face_recognition.js'
import { QualityCheck } from '../utils/biometric_quality.js'

export class BiometricService {
  constructor() {
    this.devices = new Map()
    this.faceEngine = new FaceRecognition()
    this.qualityChecker = new QualityCheck()
  }
  
  async registerDevice(deviceInfo) {
    try {
      const device = new BiometricDevice(deviceInfo)
      await device.initialize()
      
      this.devices.set(device.id, device)
      
      // Registrar device en base de datos
      await prisma.biometricDevice.create({
        data: {
          deviceId: device.id,
          model: device.model,
          location: deviceInfo.location,
          capabilities: JSON.stringify(device.capabilities),
          status: 'ACTIVE'
        }
      })
      
      return { success: true, device: device.getInfo() }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  async enrollStudent(studentId, biometricData) {
    try {
      // Validar calidad de la muestra biométrica
      const qualityScore = await this.qualityChecker.assess(biometricData)
      if (qualityScore < 0.7) {
        throw new Error('Calidad de muestra biométrica insuficiente')
      }
      
      // Generar template biométrico
      const template = await this.generateTemplate(biometricData)
      
      // Verificar que no existe duplicado
      const existingMatch = await this.findDuplicate(template)
      if (existingMatch) {
        throw new Error('Template biométrico ya existe para otro estudiante')
      }
      
      // Almacenar template encriptado
      const enrollment = await prisma.biometricEnrollment.create({
        data: {
          studentId: studentId,
          templateType: biometricData.type, // FACE, FINGERPRINT
          templateData: await this.encryptTemplate(template),
          qualityScore: qualityScore,
          enrollmentDate: new Date(),
          deviceId: biometricData.deviceId
        }
      })
      
      return { 
        success: true, 
        enrollmentId: enrollment.id,
        qualityScore: qualityScore 
      }
      
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  async verifyIdentity(biometricSample) {
    try {
      const startTime = Date.now()
      
      // Generar template de la muestra
      const queryTemplate = await this.generateTemplate(biometricSample)
      
      // Buscar coincidencias en base de datos
      const candidates = await this.findCandidates(queryTemplate)
      
      let bestMatch = null
      let highestScore = 0
      
      for (const candidate of candidates) {
        const decryptedTemplate = await this.decryptTemplate(candidate.templateData)
        const similarity = await this.compareTemplates(queryTemplate, decryptedTemplate)
        
        if (similarity > highestScore && similarity > this.matchingThreshold) {
          highestScore = similarity
          bestMatch = candidate
        }
      }
      
      const verificationTime = Date.now() - startTime
      
      if (bestMatch) {
        // Registrar verificación exitosa
        await this.logVerification({
          studentId: bestMatch.studentId,
          deviceId: biometricSample.deviceId,
          score: highestScore,
          verificationTime: verificationTime,
          timestamp: new Date()
        })
        
        return {
          success: true,
          studentId: bestMatch.studentId,
          confidence: highestScore,
          verificationTime: verificationTime
        }
      }
      
      // No se encontró coincidencia
      await this.logFailedVerification({
        deviceId: biometricSample.deviceId,
        reason: 'NO_MATCH',
        timestamp: new Date()
      })
      
      return {
        success: false,
        error: 'No se pudo verificar la identidad',
        verificationTime: verificationTime
      }
      
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  async generateTemplate(biometricData) {
    switch (biometricData.type) {
      case 'FACE':
        return await this.faceEngine.encode(biometricData.image)
      case 'FINGERPRINT':
        return await this.extractMinutiae(biometricData.image)
      default:
        throw new Error('Tipo biométrico no soportado')
    }
  }
  
  async compareTemplates(template1, template2) {
    // Implementar algoritmo de comparación específico
    // Retorna score de similitud entre 0 y 1
    const distance = this.calculateDistance(template1, template2)
    return 1 - (distance / this.maxDistance)
  }
  
  get matchingThreshold() {
    return parseFloat(process.env.BIOMETRIC_THRESHOLD) || 0.85
  }
}
```

### Algoritmos de Reconocimiento Facial

```javascript
// src/ai/face_recognition.js
import cv from '@opencv4nodejs/core'
import dlib from 'dlib-node'

export class FaceRecognition {
  constructor() {
    this.detector = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2)
    this.predictor = new dlib.ShapePredictor('./models/shape_predictor_68_face_landmarks.dat')
    this.faceNet = new dlib.FaceRecognitionModel('./models/dlib_face_recognition_resnet_model_v1.dat')
  }
  
  async detectFaces(imageBuffer) {
    try {
      // Cargar imagen
      const image = cv.imdecode(imageBuffer)
      const grayImage = image.cvtColor(cv.COLOR_BGR2GRAY)
      
      // Detectar rostros
      const faces = this.detector.detectMultiScale(grayImage, {
        scaleFactor: 1.1,
        minNeighbors: 3,
        minSize: new cv.Size(80, 80)
      })
      
      return {
        success: true,
        faces: faces.objects,
        count: faces.objects.length
      }
      
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  async encode(imageBuffer) {
    try {
      const detectionResult = await this.detectFaces(imageBuffer)
      
      if (!detectionResult.success || detectionResult.count === 0) {
        throw new Error('No se detectó ningún rostro en la imagen')
      }
      
      if (detectionResult.count > 1) {
        throw new Error('Se detectaron múltiples rostros. Use una imagen con un solo rostro')
      }
      
      const face = detectionResult.faces[0]
      const image = cv.imdecode(imageBuffer)
      
      // Extraer región de interés
      const faceROI = image.getRegion(face)
      
      // Detectar landmarks faciales
      const landmarks = await this.predictor.predict(image, face)
      
      // Generar encoding del rostro
      const encoding = await this.faceNet.computeFaceDescriptor(image, landmarks)
      
      return {
        encoding: Array.from(encoding),
        landmarks: landmarks,
        boundingBox: face,
        confidence: this.calculateConfidence(encoding)
      }
      
    } catch (error) {
      throw new Error(`Error en encoding facial: ${error.message}`)
    }
  }
  
  calculateConfidence(encoding) {
    // Calcular métricas de calidad del encoding
    const magnitude = Math.sqrt(encoding.reduce((sum, val) => sum + val * val, 0))
    const uniformity = this.calculateUniformity(encoding)
    
    return Math.min(1.0, magnitude * uniformity)
  }
  
  calculateUniformity(encoding) {
    const mean = encoding.reduce((sum, val) => sum + val, 0) / encoding.length
    const variance = encoding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / encoding.length
    
    return 1.0 / (1.0 + variance)
  }
}
```

### Protocolos de Seguridad Biométrica

```javascript
// src/security/biometric_security.js
import crypto from 'crypto'

export class BiometricSecurity {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.keyDerivation = 'pbkdf2'
    this.iterations = 100000
  }
  
  async encryptTemplate(template, metadata = {}) {
    try {
      // Generar salt único para cada template
      const salt = crypto.randomBytes(32)
      
      // Derivar clave de encriptación
      const key = crypto.pbkdf2Sync(
        process.env.BIOMETRIC_MASTER_KEY,
        salt,
        this.iterations,
        32,
        'sha512'
      )
      
      // Encriptar template
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher(this.algorithm, key)
      cipher.setAAD(Buffer.from(JSON.stringify(metadata)))
      
      let encrypted = cipher.update(Buffer.from(JSON.stringify(template)), 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()
      
      return {
        encrypted: encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        metadata: metadata
      }
      
    } catch (error) {
      throw new Error(`Error en encriptación biométrica: ${error.message}`)
    }
  }
  
  async decryptTemplate(encryptedData) {
    try {
      // Reconstruir clave
      const salt = Buffer.from(encryptedData.salt, 'hex')
      const key = crypto.pbkdf2Sync(
        process.env.BIOMETRIC_MASTER_KEY,
        salt,
        this.iterations,
        32,
        'sha512'
      )
      
      // Desencriptar
      const decipher = crypto.createDecipher(this.algorithm, key)
      decipher.setAAD(Buffer.from(JSON.stringify(encryptedData.metadata)))
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return JSON.parse(decrypted)
      
    } catch (error) {
      throw new Error(`Error en desencriptación biométrica: ${error.message}`)
    }
  }
  
  async generateBiometricHash(template) {
    // Hash irreversible para detección de duplicados sin exponer template
    const templateString = JSON.stringify(template)
    const hash = crypto.createHash('sha256')
    hash.update(templateString)
    hash.update(process.env.BIOMETRIC_SALT)
    
    return hash.digest('hex')
  }
  
  async auditBiometricAccess(operation, metadata) {
    try {
      await prisma.biometricAuditLog.create({
        data: {
          operation: operation,
          userId: metadata.userId,
          studentId: metadata.studentId,
          deviceId: metadata.deviceId,
          ipAddress: metadata.ipAddress,
          success: metadata.success,
          errorCode: metadata.errorCode,
          processingTime: metadata.processingTime,
          timestamp: new Date(),
          additionalData: JSON.stringify(metadata.additional || {})
        }
      })
    } catch (error) {
      console.warn('Fallo en auditoría biométrica:', error.message)
    }
  }
}
```

## Arquitectura Avanzada de Base de Datos

### Diseño del Esquema Completo

```prisma
// Extensión del esquema principal con optimizaciones avanzadas

// Particionado por año académico
model Attendance {
  id              Int      @id @default(autoincrement())
  student_id      Int
  classroom_id    Int
  date            DateTime @db.Date
  status          AttendanceStatus @default(PRESENT)
  checkInTime     DateTime?
  checkOutTime    DateTime?
  fraction        Float    @default(0) @db.Real
  absenceFraction Float    @default(0) @db.Real
  notes           String?  @db.VarChar(500)
  locked_at       DateTime?
  locked_reason   String?  @db.VarChar(100)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  // Campos adicionales para analytics
  academic_year   Int      // Año académico para particionado
  day_of_week     Int      // 1-7 para análisis por día de semana
  week_of_year    Int      // 1-53 para análisis semanal
  month_of_year   Int      // 1-12 para análisis mensual
  
  // Índices compuestos optimizados
  @@unique([student_id, date])
  @@index([classroom_id, date])
  @@index([academic_year, status])
  @@index([date, status])
  @@index([day_of_week, created_at])
  @@index([week_of_year, academic_year])
  @@index([month_of_year, academic_year])
  
  // Índice parcial para registros activos
  @@index([student_id, status], map: "idx_student_active_status") 
    where: "locked_at IS NULL"
  
  // Índice para consultas de rango temporal
  @@index([created_at, updated_at])
  
  @@map("attendances")
}

// Tabla de agregados materializados para performance
model AttendanceSummary {
  id                    Int      @id @default(autoincrement())
  student_id            Int
  classroom_id          Int
  academic_year         Int
  month                 Int
  total_days            Int      @default(0)
  present_days          Int      @default(0)
  absent_days           Int      @default(0)
  late_days             Int      @default(0)
  early_exit_days       Int      @default(0)
  attendance_rate       Float    @default(0) @db.Real
  absence_fraction_sum  Float    @default(0) @db.Real
  last_updated          DateTime @updatedAt
  
  @@unique([student_id, classroom_id, academic_year, month])
  @@index([academic_year, month])
  @@index([classroom_id, academic_year])
  @@index([attendance_rate])
  
  @@map("attendance_summaries")
}

// Tabla de métricas en tiempo real
model RealtimeMetrics {
  id                  Int      @id @default(autoincrement())
  metric_type         String   @db.VarChar(50)
  entity_type         String   @db.VarChar(50)
  entity_id           Int
  metric_value        Float    @db.Real
  metric_metadata     Json?
  calculated_at       DateTime @default(now())
  valid_until         DateTime?
  
  @@index([metric_type, entity_type, entity_id])
  @@index([calculated_at])
  @@index([valid_until])
  
  @@map("realtime_metrics")
}
```

### Estrategias de Optimización

```javascript
// src/database/optimizations.js

export class DatabaseOptimizer {
  constructor() {
    this.prisma = prisma
    this.queryCache = new Map()
    this.cacheTimeout = 300000 // 5 minutos
  }
  
  // Consulta optimizada con cache inteligente
  async optimizedQuery(queryKey, queryFunction, cacheTime = this.cacheTimeout) {
    const cached = this.queryCache.get(queryKey)
    
    if (cached && (Date.now() - cached.timestamp) < cacheTime) {
      return cached.data
    }
    
    const startTime = Date.now()
    const result = await queryFunction()
    const duration = Date.now() - startTime
    
    // Solo cachear consultas que tomen más de 100ms
    if (duration > 100) {
      this.queryCache.set(queryKey, {
        data: result,
        timestamp: Date.now()
      })
    }
    
    // Log de performance
    if (duration > 1000) {
      console.warn(`Consulta lenta detectada: ${queryKey} - ${duration}ms`)
    }
    
    return result
  }
  
  // Agregación optimizada para reportes
  async generateAttendanceReport(params) {
    const { classroomId, startDate, endDate, groupBy = 'month' } = params
    
    // Usar vista materializada si existe
    if (await this.materializedViewExists('attendance_summary_view')) {
      return await this.queryMaterializedView('attendance_summary_view', params)
    }
    
    // Fallback a consulta directa optimizada
    return await this.prisma.$queryRaw`
      SELECT 
        ${this.getGroupByClause(groupBy)} as period,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent_count,
        AVG(fraction) as avg_fraction,
        SUM(absence_fraction) as total_absence_fraction
      FROM attendances 
      WHERE classroom_id = ${classroomId}
        AND date BETWEEN ${startDate} AND ${endDate}
      GROUP BY ${this.getGroupByClause(groupBy)}
      ORDER BY period ASC
    `
  }
  
  // Índices dinámicos basados en patrones de consulta
  async analyzeQueryPatterns() {
    const patterns = await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation,
        most_common_vals
      FROM pg_stats 
      WHERE schemaname = 'public' 
        AND tablename IN ('attendances', 'students', 'classrooms')
    `
    
    // Sugerir índices basados en cardinalidad y correlación
    const suggestions = this.generateIndexSuggestions(patterns)
    
    return {
      currentStats: patterns,
      indexSuggestions: suggestions,
      timestamp: new Date()
    }
  }
  
  // Particionado automático por año académico
  async createYearPartition(year) {
    const partitionName = `attendances_${year}`
    const startDate = `${year}-01-01`
    const endDate = `${year + 1}-01-01`
    
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE ${partitionName} PARTITION OF attendances
        FOR VALUES FROM ('${startDate}') TO ('${endDate}')
      `)
      
      // Crear índices específicos para la partición
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX ${partitionName}_student_date_idx 
        ON ${partitionName} (student_id, date)
      `)
      
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX ${partitionName}_classroom_date_idx 
        ON ${partitionName} (classroom_id, date)
      `)
      
      return { success: true, partition: partitionName }
      
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // Mantenimiento automático de índices
  async performIndexMaintenance() {
    const maintenanceTasks = []
    
    // Reindexar índices fragmentados
    const fragmentedIndexes = await this.findFragmentedIndexes()
    for (const index of fragmentedIndexes) {
      maintenanceTasks.push(this.reindexConcurrently(index))
    }
    
    // Actualizar estadísticas
    maintenanceTasks.push(this.updateTableStatistics())
    
    // Limpiar consultas cacheadas obsoletas
    maintenanceTasks.push(this.cleanupQueryCache())
    
    const results = await Promise.allSettled(maintenanceTasks)
    
    return {
      completed: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results
    }
  }
  
  async findFragmentedIndexes(threshold = 0.3) {
    return await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as size,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE idx_scan > 0
        AND pg_relation_size(indexrelid) > 1024*1024 -- Índices > 1MB
      ORDER BY pg_relation_size(indexrelid) DESC
    `
  }
}
```

## Sistema Avanzado de Reportes y Analytics

### Motor de Reportes Configurables

```javascript
// src/reports/report_engine.js

export class ReportEngine {
  constructor() {
    this.generators = new Map()
    this.formatters = new Map()
    this.scheduledReports = new Map()
    
    this.registerDefaultGenerators()
    this.registerDefaultFormatters()
  }
  
  registerDefaultGenerators() {
    // Reporte de asistencia detallado
    this.generators.set('detailed_attendance', {
      name: 'Reporte de Asistencia Detallado',
      description: 'Análisis completo de asistencia por estudiante y período',
      parameters: [
        { name: 'classroomId', type: 'integer', required: true },
        { name: 'startDate', type: 'date', required: true },
        { name: 'endDate', type: 'date', required: true },
        { name: 'includeEvents', type: 'boolean', default: false },
        { name: 'groupBy', type: 'enum', values: ['day', 'week', 'month'], default: 'day' }
      ],
      generator: this.generateDetailedAttendanceReport.bind(this)
    })
    
    // Reporte de tendencias
    this.generators.set('attendance_trends', {
      name: 'Análisis de Tendencias de Asistencia',
      description: 'Identificación de patrones y tendencias temporales',
      parameters: [
        { name: 'scope', type: 'enum', values: ['student', 'classroom', 'school'], required: true },
        { name: 'entityId', type: 'integer', required: true },
        { name: 'timeframe', type: 'enum', values: ['month', 'quarter', 'year'], default: 'month' }
      ],
      generator: this.generateTrendsReport.bind(this)
    })
    
    // Reporte de alertas tempranas
    this.generators.set('early_warning', {
      name: 'Sistema de Alertas Tempranas',
      description: 'Identificación de estudiantes en riesgo académico',
      parameters: [
        { name: 'thresholds', type: 'object', required: true },
        { name: 'scope', type: 'enum', values: ['classroom', 'year', 'school'], default: 'classroom' }
      ],
      generator: this.generateEarlyWarningReport.bind(this)
    })
  }
  
  async generateDetailedAttendanceReport(parameters) {
    const { classroomId, startDate, endDate, includeEvents, groupBy } = parameters
    
    try {
      // Consulta base optimizada con agregaciones
      const baseQuery = `
        WITH attendance_data AS (
          SELECT 
            s.id as student_id,
            s.first_name,
            s.last_name,
            s.dni,
            a.date,
            a.status,
            a.fraction,
            a.absence_fraction,
            a.check_in_time,
            a.check_out_time,
            a.notes,
            ${this.getDateGrouping(groupBy, 'a.date')} as period
          FROM students s
          JOIN attendances a ON s.id = a.student_id
          WHERE a.classroom_id = $1
            AND a.date BETWEEN $2 AND $3
        ),
        student_summary AS (
          SELECT 
            student_id,
            first_name,
            last_name,
            dni,
            period,
            COUNT(*) as total_days,
            COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_days,
            COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent_days,
            COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late_days,
            AVG(fraction) as avg_fraction,
            SUM(absence_fraction) as total_absence_fraction,
            ROUND((COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2) as attendance_rate
          FROM attendance_data
          GROUP BY student_id, first_name, last_name, dni, period
        )
        SELECT * FROM student_summary
        ORDER BY last_name, first_name, period
      `
      
      const attendanceData = await this.prisma.$queryRawUnsafe(
        baseQuery, 
        classroomId, 
        startDate, 
        endDate
      )
      
      // Incluir eventos de ausencia si se solicita
      let eventsData = null
      if (includeEvents) {
        eventsData = await this.getAbsenceEvents(classroomId, startDate, endDate)
      }
      
      // Calcular estadísticas generales
      const summaryStats = await this.calculateSummaryStatistics(attendanceData)
      
      // Identificar patrones y anomalías
      const patterns = await this.identifyAttendancePatterns(attendanceData)
      
      return {
        metadata: {
          reportType: 'detailed_attendance',
          generatedAt: new Date(),
          parameters: parameters,
          recordCount: attendanceData.length
        },
        data: {
          students: attendanceData,
          events: eventsData,
          summary: summaryStats,
          patterns: patterns
        }
      }
      
    } catch (error) {
      throw new Error(`Error generando reporte detallado: ${error.message}`)
    }
  }
  
  async generateTrendsReport(parameters) {
    const { scope, entityId, timeframe } = parameters
    
    const trendQuery = this.buildTrendQuery(scope, timeframe)
    const trendData = await this.prisma.$queryRawUnsafe(trendQuery, entityId)
    
    // Análisis estadístico de tendencias
    const analysis = {
      trend: this.calculateTrend(trendData),
      seasonality: this.detectSeasonality(trendData),
      anomalies: this.detectAnomalies(trendData),
      forecasting: await this.generateForecast(trendData)
    }
    
    return {
      metadata: {
        reportType: 'attendance_trends',
        scope: scope,
        timeframe: timeframe,
        generatedAt: new Date()
      },
      data: trendData,
      analysis: analysis
    }
  }
  
  async generateEarlyWarningReport(parameters) {
    const { thresholds, scope } = parameters
    
    const warningQuery = `
      WITH risk_indicators AS (
        SELECT 
          s.id,
          s.first_name,
          s.last_name,
          s.dni,
          c.year_id,
          c.division_id,
          -- Tasa de asistencia últimos 30 días
          (
            SELECT COALESCE(AVG(CASE WHEN a.status = 'PRESENT' THEN 1.0 ELSE 0.0 END), 0)
            FROM attendances a 
            WHERE a.student_id = s.id 
              AND a.date >= CURRENT_DATE - INTERVAL '30 days'
          ) as attendance_rate_30d,
          
          -- Tendencia últimos 7 vs 30 días
          (
            SELECT COALESCE(AVG(CASE WHEN a.status = 'PRESENT' THEN 1.0 ELSE 0.0 END), 0)
            FROM attendances a 
            WHERE a.student_id = s.id 
              AND a.date >= CURRENT_DATE - INTERVAL '7 days'
          ) as attendance_rate_7d,
          
          -- Días consecutivos ausente
          (
            SELECT COUNT(*)
            FROM attendances a
            WHERE a.student_id = s.id
              AND a.status = 'ABSENT'
              AND a.date >= (
                SELECT COALESCE(MAX(a2.date), CURRENT_DATE - INTERVAL '30 days')
                FROM attendances a2
                WHERE a2.student_id = s.id AND a2.status != 'ABSENT'
              )
          ) as consecutive_absences,
          
          -- Fracción de ausencias acumulada
          COALESCE(aya.fractional_absences, 0) as yearly_absence_fraction
          
        FROM students s
        JOIN classrooms c ON s.classroom_id = c.id
        LEFT JOIN student_year_absence_aggregates aya ON s.id = aya.student_id
        WHERE s.active = true
      ),
      risk_classification AS (
        SELECT *,
          CASE 
            WHEN attendance_rate_30d < $1 OR consecutive_absences >= $2 THEN 'HIGH_RISK'
            WHEN attendance_rate_30d < $3 OR consecutive_absences >= $4 THEN 'MEDIUM_RISK'
            WHEN attendance_rate_7d < attendance_rate_30d * 0.7 THEN 'DECLINING_TREND'
            ELSE 'LOW_RISK'
          END as risk_level,
          
          CASE
            WHEN consecutive_absences >= $2 THEN 'Ausencias consecutivas excesivas'
            WHEN attendance_rate_30d < $1 THEN 'Tasa de asistencia crítica'
            WHEN attendance_rate_7d < attendance_rate_30d * 0.7 THEN 'Tendencia decreciente'
            ELSE 'Sin alertas'
          END as primary_concern
          
        FROM risk_indicators
      )
      SELECT * FROM risk_classification
      WHERE risk_level != 'LOW_RISK'
      ORDER BY 
        CASE risk_level 
          WHEN 'HIGH_RISK' THEN 1 
          WHEN 'MEDIUM_RISK' THEN 2 
          WHEN 'DECLINING_TREND' THEN 3 
        END,
        attendance_rate_30d ASC
    `
    
    const riskStudents = await this.prisma.$queryRawUnsafe(
      warningQuery,
      thresholds.criticalAttendance || 0.7,
      thresholds.criticalConsecutive || 5,
      thresholds.mediumAttendance || 0.8,
      thresholds.mediumConsecutive || 3
    )
    
    return {
      metadata: {
        reportType: 'early_warning',
        thresholds: thresholds,
        generatedAt: new Date(),
        studentsAtRisk: riskStudents.length
      },
      data: {
        highRisk: riskStudents.filter(s => s.risk_level === 'HIGH_RISK'),
        mediumRisk: riskStudents.filter(s => s.risk_level === 'MEDIUM_RISK'),
        decliningTrend: riskStudents.filter(s => s.risk_level === 'DECLINING_TREND')
      },
      recommendations: this.generateInterventionRecommendations(riskStudents)
    }
  }
  
  // Sistema de programación de reportes
  async scheduleReport(reportConfig) {
    const { reportType, schedule, parameters, recipients, format } = reportConfig
    
    const scheduledReport = await this.prisma.scheduledReport.create({
      data: {
        reportType: reportType,
        schedule: JSON.stringify(schedule),
        parameters: JSON.stringify(parameters),
        recipients: JSON.stringify(recipients),
        format: format || 'PDF',
        active: true,
        createdBy: parameters.userId,
        nextRun: this.calculateNextRun(schedule)
      }
    })
    
    // Programar con cron
    this.scheduleCronJob(scheduledReport)
    
    return { success: true, scheduleId: scheduledReport.id }
  }
  
  async executeScheduledReport(scheduleId) {
    try {
      const schedule = await this.prisma.scheduledReport.findUnique({
        where: { id: scheduleId }
      })
      
      if (!schedule || !schedule.active) {
        return { success: false, error: 'Reporte programado no encontrado o inactivo' }
      }
      
      const parameters = JSON.parse(schedule.parameters)
      const generator = this.generators.get(schedule.reportType)
      
      if (!generator) {
        throw new Error(`Generador no encontrado: ${schedule.reportType}`)
      }
      
      // Generar reporte
      const report = await generator.generator(parameters)
      
      // Formatear según configuración
      const formatter = this.formatters.get(schedule.format.toLowerCase())
      const formattedReport = await formatter(report, parameters)
      
      // Enviar a destinatarios
      const recipients = JSON.parse(schedule.recipients)
      await this.distributeReport(formattedReport, recipients, schedule.format)
      
      // Actualizar siguiente ejecución
      await this.prisma.scheduledReport.update({
        where: { id: scheduleId },
        data: {
          lastRun: new Date(),
          nextRun: this.calculateNextRun(JSON.parse(schedule.schedule)),
          runCount: { increment: 1 }
        }
      })
      
      return { success: true, reportId: formattedReport.id }
      
    } catch (error) {
      // Registrar error y marcar como fallido
      await this.prisma.reportExecution.create({
        data: {
          scheduledReportId: scheduleId,
          status: 'FAILED',
          error: error.message,
          executedAt: new Date()
        }
      })
      
      return { success: false, error: error.message }
    }
  }
}
```

## Conclusión

El Sistema de Asistencia Escolar implementa una arquitectura robusta y escalable que combina las mejores prácticas de desarrollo backend moderno. La separación clara entre capas (rutas, controladores, servicios, modelo) facilita el mantenimiento y evolución del sistema, mientras que las múltiples capas de seguridad y validación garantizan la integridad de los datos académicos.

El uso de tecnologías modernas como ES Modules, Prisma ORM, JWT con refresh tokens, y un sistema de auditoría completo, proporcionan una base sólida para el crecimiento futuro del sistema. La arquitectura dual de aplicaciones permite una escalabilidad independiente y una mayor seguridad en la gestión de autenticación.

El sistema está diseñado pensando en la operatividad real de instituciones educativas, con validaciones de reglas de negocio específicas como inscripciones activas, fracciones de ausencia, y períodos académicos inmutables, asegurando que la tecnología sirva efectivamente a los procesos educativos.

### Características Avanzadas Implementadas

La documentación expandida ahora incluye:

- **Sistema Biométrico Completo**: Reconocimiento facial y de huellas dactilares con algoritmos de machine learning
- **Optimizaciones de Base de Datos**: Particionado, índices inteligentes y consultas materializadas
- **Motor de Reportes Avanzado**: Generación programática de reportes con análisis estadístico
- **Protocolos de Seguridad**: Encriptación de templates biométricos y auditoría exhaustiva
- **Analytics en Tiempo Real**: Sistema de métricas y alertas tempranas
- **Arquitectura Escalable**: Preparada para evolución a microservicios

El sistema representa una solución integral para la gestión moderna de asistencia escolar, combinando precisión tecnológica con facilidad de uso operativo.