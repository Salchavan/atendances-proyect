# Modelo de Datos v3 (Prisma + PostgreSQL)

Este documento describe con máximo detalle el esquema de base de datos vigente, sus entidades, columnas, restricciones, relaciones y convenciones de uso para que quien integre el frontend conozca exactamente qué espera cada tabla y cómo se relacionan entre sí.

Fuente del esquema: `backend/prisma/schema.prisma`
Proveedor: PostgreSQL

## Convenciones generales

- Identificadores
  - PK numéricas autoincrementales: campo `id` (Int) salvo excepciones: `AcademicYear.year` es PK natural (Int, año). `BiometricPolicy.id` fija por defecto 1.
  - FK siempre referencian el `id` (o `year` en AcademicYear) de la tabla padre.
- Fechas y horas
  - Campos `DateTime` se almacenan en UTC. En JSON se devuelven como ISO-8601 (ej. `2025-07-26T14:00:00.000Z`).
  - Horas simples se modelan como `String` en formato `HH:mm` (o `HH:mm:ss` en algunos históricos).
- Banderas y defaults
  - Booleanos con default se indican explícitamente (por ejemplo `active: true`).
- Bytes
  - Campos `Bytes` se devuelven/aceptan en JSON codificados en base64.
- Unicidad e índices
  - Se listan en cada entidad. Cuando hay `@@unique([a,b])` implica unicidad compuesta.
- Eliminaciones
  - Por defecto, las FK no definen cascada salvo donde se indique (ej.: `AbsenceEvent` y `Withdrawal` cuelgan de `Attendance` con cascade en la FK de `Attendance`).
- Nombres de enums y catálogos
  - Se devuelven y se esperan exactamente como están en el esquema (MAYÚSCULAS inglesas).

## Enums (catálogos)

- Shift: MORNING | AFTERNOON
- EnrollmentReason: INITIAL | TRANSFER | PROMOTION | REPEAT | CORRECTION
- ExitReason: GRADUATED | TRANSFERRED | DROPPED_OUT | OTHER
- Weekday: MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY
- AttendanceStatus: PRESENT | ABSENT | JUSTIFIED | WITHDRAWN
- CaptureSource: DEVICE | PRECEPTOR | SYSTEM
- CaptureMethod: FINGERPRINT | MANUAL | IMPORT
- WithdrawalType: INDIVIDUAL | CLASS_CANCELLED
- AbsenceEventType: LATE_ARRIVAL | EARLY_EXIT | JUSTIFICATION | MANUAL_ADJUST

## AcademicYear (ciclo lectivo)

- Propósito: Define el año académico (PK natural `year`). Permite cerrar el ciclo, y almacenar ventanas de calendario (inicio/fin y receso).
- Campos
  - year (Int, PK) año como 2025.
  - closedAt (DateTime?, null por defecto) fecha de cierre del ciclo.
  - closedBy (Int?, opcional) id del actor que cerró (referencial lógico).
  - createdAt (DateTime, default now())
  - updatedAt (DateTime, auto `@updatedAt`)
  - startDate (DateTime?, opcional)
  - endDate (DateTime?, opcional)
  - recessStart (DateTime?, opcional)
  - recessEnd (DateTime?, opcional)
- Índices: `@@index([closedAt])`, `@@index([startDate])`, `@@index([endDate])`
- Reglas
  - Un registro por año. El cierre congela datos de negocio a nivel aplicación (no FK).
- Uso front
  - Lectura para configurar UI del calendario; escritura usualmente por personal autorizado.

## AuditLog (auditoría)

- Propósito: Registra acciones (negocio y cambios de datos), con metadatos y snapshots.
- Campos
  - id (Int, PK autoincrement)
  - timestamp (DateTime, default now())
  - actorType (String?, ej.: 'STAFF' | 'PRECEPTOR' | 'SYSTEM')
  - actorId (Int?, id numérico del actor)
  - action (String, ej.: CREATE, UPDATE, DELETE, LOGIN)
  - entity (String, nombre lógico: Student, Attendance, etc.)
  - entityId (Int?, id afectado)
  - entityExtra (String?, dato secundario p.ej. username/dni)
  - ip (String?), userAgent (String?)
  - before (Json?), after (Json?), metadata (Json?)
- Índices: por actor, entidad y acción para consultas eficientes.
- Uso front
  - Vista sólo lectura para trazabilidad. No se crea desde front salvo endpoints de login/acciones.

## Year (catálogo de años escolares)

- Campos
  - id (Int, PK autoincrement)
  - year_number (Int, UNIQUE) valores típicos 1..7
- Relaciones
  - classrooms (Classroom[]) 1:N
- Reglas
  - No eliminar si hay Classroom asociadas.

## Division (catálogo de divisiones)

- Campos
  - id (Int, PK)
  - division_letter (String, UNIQUE) valores típicos 'A'..'F'
- Relaciones
  - classrooms (Classroom[]) 1:N
- Reglas
  - No eliminar si hay Classroom asociadas.

## Classroom (curso: año + división + turno)

- Campos
  - id (Int, PK)
  - year_id (Int, FK → Year.id)
  - division_id (Int, FK → Division.id)
  - shift (Shift, default MORNING)
  - created_at (DateTime, default now())
  - updated_at (DateTime, auto)
- Relaciones
  - year (Year), division (Division)
  - students (Student[]), enrollments (StudentEnrollment[]), exits (StudentExit[])
  - attendances (Attendance[]), withdrawals (Withdrawal[])
  - classroomsSchedules (ClassroomSchedule[]), scheduleOverrides (ScheduleOverride[])
  - classroomScheduleHistories (ClassroomScheduleHistory[])
  - assignments (Preceptory_Classroom[]), nsd_assigments (Not_school_days_assigment[])
- Restricciones
  - UNIQUE compuesta: (year_id, division_id) → una sola aula por combinación
  - Índice: [shift]
- Uso front
  - Para listados (filtros por turno), selección de curso en formularios de alumnos/asistencia.

## Student (estudiante)

- Campos
  - id (Int, PK)
  - first_name (String), last_name (String)
  - username (String) alias/legajo de uso interno en aula
  - classroom_id (Int, FK → Classroom.id) aula actual
  - active (Boolean, default true)
  - created_at (DateTime), updated_at (DateTime)
- Relaciones
  - classroom (Classroom)
  - enrollments (StudentEnrollment[]), exits (StudentExit[])
  - attendances (Attendance[])
  - nsd_assigments (Not_school_days_assigment[])
  - yearlyAbsenceAggregates (StudentYearAbsenceAggregate[])
  - biometric (StudentBiometric?)
  - biometricScanLogs (BiometricScanLog[])
- Restricciones
  - UNIQUE (classroom_id, username): no repetir alias dentro del aula
- Uso front
  - Alta/edición de alumnos, vinculación a Classroom; visualizaciones de historial y biometría.

## Preceptor / Preceptory (preceptores y preceptorías)

- Preceptor
  - id (Int, PK), first_name, last_name, dni (UNIQUE), password_hash
  - preceptories (Preceptory_Preceptor[])
- Preceptory
  - id (Int, PK), name (String)
  - preceptors (Preceptory_Preceptor[]), assignments (Preceptory_Classroom[])
- Reglas
  - Autenticación por dni+password_hash a nivel servicio; relación N:M con preceptorías.

## Tablas pivot de preceptoría

- Preceptory_Preceptor
  - id (Int, PK), preceptory_id (FK → Preceptory.id), preceptor_id (FK → Preceptor.id)
  - activo (Boolean, default true)
  - UNIQUE (preceptory_id, preceptor_id)
- Preceptory_Classroom
  - id (Int, PK), preceptory_id (FK), classroom_id (FK)
  - UNIQUE (preceptory_id, classroom_id)

## Staff (personal no docente / dirección)

- Campos
  - id (Int, PK), first_name, last_name, dni (UNIQUE), password_hash, role (String)
  - biometricEnrollments (StudentBiometric[]) referencia inversa via `enrolledBy`
- Uso front
  - Gestión de usuarios staff, permisos por `role` definidos en backend.

## StudentEnrollment (inscripción por períodos)

- Propósito: Mantener historial de pertenencia del estudiante a aulas a lo largo del tiempo.
- Campos
  - id (Int, PK)
  - student_id (Int, FK → Student.id)
  - classroom_id (Int, FK → Classroom.id)
  - startDate (DateTime), endDate (DateTime?)
  - reason (EnrollmentReason, default INITIAL)
  - promotedFromEnrollmentId (Int?, FK auto-referencial)
- Relaciones
  - promotedFrom (StudentEnrollment?), promotions (StudentEnrollment[])
- Índices
  - [student_id], [classroom_id], [promotedFromEnrollmentId], [student_id, startDate, endDate]
- Uso front
  - Altas/cambios de curso conservando historia; consultas por rango temporal.

## StudentExit (egreso del estudiante)

- Campos
  - id (Int, PK)
  - student_id (Int, FK → Student.id)
  - classroom_id (Int, FK → Classroom.id)
  - date (DateTime), reason (ExitReason), notes (String?)
- Uso front
  - Registrar egresos con motivo y fecha.

## Schedule (catálogo de tramos horarios)

- Campos
  - id (Int, PK)
  - weekday (Weekday)
  - startTime (String, HH:mm), endTime (String, HH:mm)
- Restricciones
  - UNIQUE (weekday, startTime, endTime)
- Uso front
  - Catálogo reutilizable para armar grillas horarias.

## ClassroomSchedule (asignación aula-horario)

- Campos
  - id (Int, PK), classroom_id (FK), schedule_id (FK onDelete: Restrict)
- Restricciones
  - UNIQUE (classroom_id, schedule_id)
- Uso front
  - Grilla por aula. No se puede borrar un `Schedule` en uso por Restrict.

## Attendance (asistencia diaria por estudiante)

- Campos
  - id (Int, PK)
  - student_id (Int, FK → Student.id)
  - classroom_id (Int, FK → Classroom.id)
  - date (DateTime, sólo fecha utilizada a nivel negocio)
  - checkInTime (String?, HH:mm), checkOutTime (String?, HH:mm)
  - status (AttendanceStatus, default PRESENT)
  - fraction (Float) fracción primaria registrada (0 = presente completo; 1 = ausencia completa). Ver notas.
  - notes (String?)
  - absenceFraction (Float, default 0) acumulado calculado por eventos (ver AbsenceEvent)
  - locked_at (DateTime?), locked_reason (String?) bloqueo de edición
  - device_id (Int?, FK → BiometricDevice.id)
  - capturedBy (CaptureSource?), captureMethod (CaptureMethod?)
- Relaciones
  - withdrawal (Withdrawal?) 1:1 opcional
  - events (AbsenceEvent[])
- Restricciones
  - UNIQUE (student_id, date) una asistencia por alumno/día
  - Índices: [student_id, date], [classroom_id, date], [device_id, date], [status, date]
- Notas de negocio
  - `fraction` representa lo capturado en el registro primario; `absenceFraction` refleja el acumulado tras aplicar `AbsenceEvent` (tardanzas, salidas, justificaciones). El backend es fuente de verdad del cálculo.

## Withdrawal (retiros)

- Campos
  - id (Int, PK)
  - attendance_id (Int?, FK UNIQUE → Attendance.id, onDelete: Cascade)
  - classroom_id (Int?, FK → Classroom.id)
  - date (DateTime?) fecha del retiro (además de `withdrawalTime`)
  - withdrawalTime (String, HH:mm)
  - reason (String), type (WithdrawalType)
  - authorizedBy (String?)
  - locked_at (DateTime?), locked_reason (String?)
- Reglas
  - Si se elimina la `Attendance` asociada, el `Withdrawal` se elimina por cascade.

## AbsenceEvent (eventos que ajustan falta)

- Campos
  - id (Int, PK)
  - attendance_id (Int, FK → Attendance.id, onDelete: Cascade)
  - type (AbsenceEventType)
  - fractionDelta (Float) positivo suma falta, negativo descuenta (justificaciones)
  - timeMark (String?, HH:mm), reason (String?), authorizedBy (String?)
  - metadata (Json?)
  - created_at (DateTime, default now())
  - locked_at (DateTime?), locked_reason (String?)
- Índices: [attendance_id, type], [created_at]

## ScheduleOverride (excepciones puntuales de horario)

- Campos
  - id (Int, PK)
  - classroom_id (Int, FK → Classroom.id)
  - schedule_id (Int, FK → Schedule.id)
  - date (DateTime)
  - newStartTime (String?), newEndTime (String?), reason (String?)
- Restricciones
  - UNIQUE (classroom_id, schedule_id, date)

## ClassroomScheduleHistory (histórico de horarios)

- Campos
  - id (Int, PK)
  - classroom_id (Int, FK → Classroom.id)
  - weekday (Weekday)
  - startTime (String), endTime (String)
  - validFrom (DateTime), validTo (DateTime?)
- Índice compuesto: [classroom_id, weekday, validFrom, validTo]

## Not_school_day (feriados/asuetos escolares)

- Campos
  - id (Int, PK)
  - date (DateTime), reason (String)
- Restricción
  - UNIQUE (date)

## Not_school_days_assigment (asignaciones de día sin clase)

- Campos
  - id (Int, PK)
  - date (DateTime), reason (String)
  - classroom_id (Int?, FK → Classroom.id)
  - student_id (Int?, FK → Student.id)
- Uso
  - Permite definir no lectivo para un curso o estudiante específico.

## StudentYearAbsenceAggregate (acumulador anual por alumno)

- Campos
  - id (Int, PK)
  - student_id (Int, FK → Student.id)
  - year (Int, año académico = `AcademicYear.year`)
  - wholeAbsences (Int, default 0)
  - fractional (Float, default 0)
  - updatedAt (DateTime, auto)
- Restricciones
  - UNIQUE (student_id, year), Índice [year]
- Uso
  - Lectura rápida para reportes/boletines. Se recalcula por backend ante cambios.

## Biometría

### BiometricDevice (dispositivo lector)

- Campos
  - id (Int, PK)
  - name (String), serialNumber (String UNIQUE), apiKeyHash (String UNIQUE)
  - active (Boolean default true)
  - ipAllowlist (String?), lastSeenAt (DateTime?)
  - createdAt (DateTime), updatedAt (DateTime)
- Relaciones: attendances (Attendance[]), scanLogs (BiometricScanLog[]), keys (BiometricDeviceKey[])

### StudentBiometric (plantilla de alumno)

- Campos
  - id (Int, PK)
  - student_id (Int UNIQUE, FK → Student.id)
  - algorithm (String), version (Int default 1)
  - template (Bytes?) base64 en JSON
  - keyId (String?)
  - enrolledAt (DateTime), updatedAt (DateTime), active (Boolean default true)
  - enrolledBy (Int?, FK → Staff.id)

### BiometricScanLog (log de escaneos)

- Campos
  - id (Int, PK)
  - device_id (Int, FK → BiometricDevice.id)
  - student_id (Int?, FK → Student.id)
  - matched (Boolean), confidence (Float?)
  - timestamp (DateTime, default now())
  - error (String?), metadata (Json?)
- Índices: [timestamp], [student_id, timestamp], [device_id, timestamp]

### BiometricPolicy (política global)

- Campos
  - id (Int, PK default 1)
  - requireDeviceAuth (Boolean default true)
  - minConfidenceMatch (Float default 0.6)
  - allowManualOverride (Boolean default true)
  - fingerprintAlgorithm (String default "ISO19794-2")
  - templateVersion (Int default 1)
  - createdAt (DateTime), updatedAt (DateTime)

### BiometricDeviceKey (rotación de API keys)

- Campos
  - id (Int, PK autoincrement)
  - device_id (Int, FK → BiometricDevice.id)
  - apiKeyHash (String UNIQUE)
  - createdAt (DateTime default now()), revokedAt (DateTime?), expiresAt (DateTime?), note (String?)
- Índice: [device_id, createdAt]

## ER: Relaciones clave (resumen en texto)

- Year 1:N Classroom; Division 1:N Classroom; (year_id, division_id) único en Classroom
- Classroom 1:N Student, StudentEnrollment, StudentExit, Attendance, Withdrawal, ClassroomSchedule, ScheduleOverride, ClassroomScheduleHistory; N:M con Preceptory (via Preceptory_Classroom)
- Student 1:N StudentEnrollment, StudentExit, Attendance; 1:1 StudentBiometric; 1:N BiometricScanLog; 1:N StudentYearAbsenceAggregate
- Schedule 1:N ClassroomSchedule, 1:N ScheduleOverride
- Attendance 1:? AbsenceEvent; 1:0..1 Withdrawal (único)
- Preceptory N:M Preceptor (via Preceptory_Preceptor)
- BiometricDevice 1:N BiometricDeviceKey, 1:N BiometricScanLog, 1:N Attendance

## Guía para el frontend (formatos y payloads)

- Fechas: siempre ISO-8601 en UTC. El backend acepta/retorna `2025-03-10T00:00:00.000Z`.
- Horarios: cadenas `HH:mm`. Validar client-side.
- Enums: usar literales exactos listados arriba.
- Claves foráneas: enviar `id` (o `year` para AcademicYear) del recurso padre.
- Unicidad a respetar en UI
  - Student: (classroom_id, username)
  - Classroom: (year_id, division_id)
  - ClassroomSchedule: (classroom_id, schedule_id)
  - Schedule: (weekday, startTime, endTime)
  - ScheduleOverride: (classroom_id, schedule_id, date)
  - Withdrawal.attendance_id único
- Ejemplos JSON (mínimos)
  - Crear Student
    - { "first_name":"Ana","last_name":"Pérez","username":"aperez","classroom_id":12, "active":true }
  - Registrar Attendance presente
    - { "student_id":123, "classroom_id":12, "date":"2025-06-11T00:00:00.000Z", "status":"PRESENT", "fraction":0, "checkInTime":"08:00" }
  - Agregar AbsenceEvent tardanza de 0.25
    - { "attendance_id":555, "type":"LATE_ARRIVAL", "fractionDelta":0.25, "timeMark":"08:20", "reason":"Trafico" }
  - Crear Withdrawal individual 10:30
    - { "attendance_id":555, "withdrawalTime":"10:30", "type":"INDIVIDUAL", "reason":"Médico", "authorizedBy":"Dirección" }

## Índices y rendimiento (consulta rápida)

- Búsqueda de asistencias por alumno/día: índice [student_id, date].
- Listado por aula y día: índice [classroom_id, date].
- Filtrado por estado: índice [status, date].
- Logs biométricos por rango: índices por timestamp y device/student.
- Auditoría: índices por entidad, actor y acción.

## Notas de integridad y edge cases

- Attendance única por alumno/día: la UI debe prevenir duplicados.
- Eliminaciones encadenadas
  - Borrar Attendance elimina sus AbsenceEvent y Withdrawal (cascade en FKs respectivas).
- Historial de Enrollment: preferir cerrar períodos (`endDate`) antes de reasignar aula, en lugar de borrar.
- Política biométrica: una fila global (id=1). Editar en consola de administración.

## Glosario rápido de columnas sensibles

- fraction vs absenceFraction (Attendance)
  - fraction: valor base capturado.
  - absenceFraction: acumulado resultante tras aplicar AbsenceEvent. El backend recalcula.
- locked_at / locked_reason
  - Señales de inmutabilidad temporal; la UI debe respetarlas evitando edición.
- template (StudentBiometric)
  - Bytes en base64 en JSON.

---

Este v3 recoge las restricciones de unicidad, relaciones y semántica de campos conforme al schema actual. Para cualquier endpoint específico del backend (rutas, validaciones adicionales y permisos), ver la documentación de la API en `backend/openapi.json` y los middlewares de seguridad ya integrados.
