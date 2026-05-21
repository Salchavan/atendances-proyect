# API de Estadísticas - Sistema de Asistencia Escolar

Documentación completa del módulo de estadísticas y análisis de datos de asistencia.

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Conceptos Clave](#conceptos-clave)
- [Endpoints](#endpoints)
  - [Opciones Disponibles](#opciones-disponibles)
  - [Consulta de Métricas](#consulta-de-métricas)
  - [Comparación de Targets](#comparación-de-targets)
  - [Rankings](#rankings)
  - [Series Temporales](#series-temporales)
  - [Intervalos](#intervalos)
  - [Mapa de Calor](#mapa-de-calor)
  - [Dispersión](#dispersión)
  - [Mejoras](#mejoras)

---

## Introducción

El módulo de estadísticas proporciona análisis avanzados sobre datos de asistencia, permitiendo consultas agregadas, comparaciones, rankings y visualizaciones de tendencias.

**Base URL**: `/api/v1/stats`

**Autenticación**: Todos los endpoints requieren token JWT válido

---

## Conceptos Clave

### Targets (Objetivos de Análisis)

Un **target** define el alcance del análisis. Tipos disponibles:

| Tipo | Descripción | Parámetros Requeridos | Ejemplo |
|------|-------------|----------------------|---------|
| `STUDENT` | Estudiante individual | `type`, `id` | `{ "type": "STUDENT", "id": 42 }` |
| `CLASSROOM` | Aula completa | `type`, `id` | `{ "type": "CLASSROOM", "id": 5 }` |
| `YEAR` | Año escolar (todos los turnos) | `type`, `year` | `{ "type": "YEAR", "year": 1 }` |
| `SHIFT` | Turno específico | `type`, `value` | `{ "type": "SHIFT", "value": "MORNING" }` |

### Métricas Disponibles

Las métricas calculan diferentes aspectos de asistencia:

- **`attendancePct`**: Porcentaje de asistencia (presentes/total)
- **`absent`**: Total de ausencias
- **`present`**: Total de presencias
- **`late`**: Total de llegadas tarde
- **`absenceFraction`**: Fracción acumulada de ausencias (incluye parciales)
- **`wholeAbsences`**: Ausencias completas (días enteros)

### Dimensiones de Análisis

- **Temporales**: `day`, `week`, `month`, `year`
- **Intervalos**: `weekday` (lunes-viernes), `hour` (franjas horarias)
- **Contextuales**: `classroom`, `shift`, `grade`

---

## Endpoints

### Opciones Disponibles

#### `GET /api/v1/stats/options`

Obtiene la lista de métricas, targets y opciones disponibles para consultas.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Respuesta

##### ✅ 200 OK
```json
{
  "success": true,
  "metrics": [
    "attendancePct",
    "absent",
    "present",
    "late",
    "absenceFraction",
    "wholeAbsences"
  ],
  "targets": [
    "STUDENT",
    "CLASSROOM",
    "YEAR",
    "SHIFT"
  ]
}
```

---

### Consulta de Métricas

#### `POST /api/v1/stats/query`

Calcula métricas agregadas para un target específico.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "target": {
    "type": "CLASSROOM",
    "id": 5
  }
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `target` | object | ✅ Sí | Target de análisis (ver tipos arriba) |

#### Ejemplos de Targets

**Estudiante individual**:
```json
{
  "target": {
    "type": "STUDENT",
    "id": 42
  }
}
```

**Aula completa**:
```json
{
  "target": {
    "type": "CLASSROOM",
    "id": 5
  }
}
```

**Año escolar**:
```json
{
  "target": {
    "type": "YEAR",
    "year": 1
  }
}
```

**Turno**:
```json
{
  "target": {
    "type": "SHIFT",
    "value": "MORNING"
  }
}
```

#### Respuesta

##### ✅ 200 OK - Métricas calculadas
```json
{
  "success": true,
  "target": {
    "type": "CLASSROOM",
    "id": 5
  },
  "metrics": {
    "attendancePct": 94.5,
    "absent": 12,
    "present": 188,
    "late": 8,
    "absenceFraction": 0.065,
    "wholeAbsences": 11,
    "totalDays": 200,
    "avgAttendancePct": 94.5
  }
}
```

##### ❌ 400 Bad Request - Target inválido
```json
{
  "success": false,
  "message": "Target inválido"
}
```

#### Códigos de Estado
- `200` - Consulta exitosa
- `400` - Target inválido o mal formado
- `401` - No autenticado

---

### Comparación de Targets

#### `POST /api/v1/stats/compare`

Compara métricas entre múltiples targets (ej: comparar dos aulas, dos estudiantes, etc.).

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "targets": [
    { "type": "CLASSROOM", "id": 5 },
    { "type": "CLASSROOM", "id": 6 },
    { "type": "CLASSROOM", "id": 7 }
  ]
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `targets` | array | ✅ Sí | Lista de targets a comparar (mínimo 2) |

#### Respuesta

##### ✅ 200 OK - Comparación exitosa
```json
{
  "success": true,
  "results": [
    {
      "target": { "type": "CLASSROOM", "id": 5 },
      "metrics": {
        "attendancePct": 94.5,
        "absent": 12,
        "present": 188
      }
    },
    {
      "target": { "type": "CLASSROOM", "id": 6 },
      "metrics": {
        "attendancePct": 91.2,
        "absent": 18,
        "present": 182
      }
    },
    {
      "target": { "type": "CLASSROOM", "id": 7 },
      "metrics": {
        "attendancePct": 96.8,
        "absent": 7,
        "present": 193
      }
    }
  ]
}
```

##### ❌ 400 Bad Request - Pocos targets
```json
{
  "success": false,
  "message": "Provee al menos dos targets"
}
```

#### Códigos de Estado
- `200` - Comparación exitosa
- `400` - Menos de 2 targets o targets inválidos
- `401` - No autenticado

---

### Rankings

#### `GET /api/v1/stats/rankings`

Obtiene un ranking ordenado por métrica específica.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `scope` | string | ❌ No | Alcance: `CLASSROOM`, `STUDENT` | `CLASSROOM` |
| `metric` | string | ❌ No | Métrica a rankear | `attendancePct` |
| `limit` | number | ❌ No | Cantidad de resultados (top N) | `10` |

#### Ejemplo de Request
```http
GET /api/v1/stats/rankings?scope=CLASSROOM&metric=attendancePct&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK - Ranking generado
```json
{
  "success": true,
  "scope": "CLASSROOM",
  "metric": "attendancePct",
  "limit": 5,
  "list": [
    {
      "key": "1° A - Mañana",
      "classroomId": 7,
      "total": 1,
      "present": 1,
      "absent": 0,
      "justified": 0,
      "withdrawn": 0,
      "attendancePct": 1,
      "absencePct": 0,
      "events": {
        "late": 1,
        "early": 1,
        "justifications": 0,
        "manualAdjusts": 0
      },
      "fractionalAnnual": 0.75
    },
    {
      "key": "1° B - Mañana",
      "classroomId": 8,
      "total": 1,
      "present": 1,
      "absent": 0,
      "justified": 0,
      "withdrawn": 0,
      "attendancePct": 1,
      "absencePct": 0,
      "events": {
        "late": 1,
        "early": 0,
        "justifications": 0,
        "manualAdjusts": 0
      },
      "fractionalAnnual": 0.25
    },
    {
      "key": "1° C - Tarde",
      "classroomId": 9,
      "total": 1,
      "present": 1,
      "absent": 0,
      "justified": 0,
      "withdrawn": 0,
      "attendancePct": 1,
      "absencePct": 0,
      "events": {
        "late": 0,
        "early": 1,
        "justifications": 0,
        "manualAdjusts": 0
      },
      "fractionalAnnual": 0.5
    }
  ]
}
```

**Nota**: Cada objeto en `list` incluye:
- **`key`**: Identificador legible (formato: `año° división - turno`, ej: `1° A - Mañana`)
- **`classroomId`**: ID del aula
- **Contadores**: `total`, `present`, `absent`, `justified`, `withdrawn`
- **Porcentajes**: `attendancePct` (asistencia), `absencePct` (ausencia)
- **`events`**: Desglose de eventos (llegadas tarde, salidas tempranas, justificaciones, ajustes manuales)
- **`fractionalAnnual`**: Suma total de ausencias anuales de todos los estudiantes del aula (incluye fracciones por llegadas tarde y salidas tempranas)

#### Códigos de Estado
- `200` - Ranking generado exitosamente
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Series Temporales

#### `GET /api/v1/stats/timeseries`

Obtiene la evolución de una métrica a lo largo del tiempo.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `type` | string | ✅ Sí | Tipo de target | - |
| `id` | number | Condicional | ID (si type=STUDENT o CLASSROOM) | - |
| `year` | number | Condicional | Año (si type=YEAR) | - |
| `value` | string | Condicional | Valor (si type=SHIFT) | - |
| `granularity` | string | ❌ No | `day`, `week`, `month`, `year` | `month` |
| `metric` | string | ❌ No | Métrica a graficar | `attendancePct` |
| `from` | string | ❌ No | Fecha inicio (ISO 8601) | - |
| `to` | string | ❌ No | Fecha fin (ISO 8601) | - |

#### Ejemplo de Request
```http
GET /api/v1/stats/timeseries?type=CLASSROOM&id=5&granularity=month&metric=attendancePct&from=2025-01-01&to=2025-11-30
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK - Serie temporal generada
```json
{
  "success": true,
  "granularity": "month",
  "metric": "attendancePct",
  "series": [
    {
      "key": "2025-03",
      "value": 0.942,
      "counts": {
        "total": 120,
        "present": 113,
        "absent": 5,
        "justified": 2,
        "withdrawn": 0,
        "events": {
          "late": 8,
          "early": 3,
          "justifications": 2,
          "manualAdjusts": 0
        }
      }
    },
    {
      "key": "2025-04",
      "value": 0.955,
      "counts": {
        "total": 115,
        "present": 110,
        "absent": 3,
        "justified": 2,
        "withdrawn": 0,
        "events": {
          "late": 5,
          "early": 2,
          "justifications": 2,
          "manualAdjusts": 0
        }
      }
    },
    {
      "key": "2025-05",
      "value": 0.928,
      "counts": {
        "total": 125,
        "present": 116,
        "absent": 7,
        "justified": 2,
        "withdrawn": 0,
        "events": {
          "late": 10,
          "early": 4,
          "justifications": 2,
          "manualAdjusts": 0
        }
      }
    }
  ]
}
```

**Nota sobre la respuesta**:
- **`series`**: Array de puntos temporales ordenados cronológicamente
- **`key`**: Periodo en formato ISO (ej: `2025-03` para mes, `2025-W12` para semana, `2025-03-15` para día)
- **`value`**: Valor calculado de la métrica seleccionada (puede ser `null` si no hay datos)
- **`counts`**: Desglose completo de contadores para ese periodo
  - `total`, `present`, `absent`, `justified`, `withdrawn`: Conteo de registros de asistencia
  - `events`: Conteo de eventos especiales (llegadas tarde, salidas tempranas, etc.)

**Importante**: Si `value` es `null`, significa que no hay registros de asistencia para ese periodo (aunque puede haber eventos).

#### Códigos de Estado
- `200` - Serie generada exitosamente
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Intervalos

#### `GET /api/v1/stats/intervals`

Analiza una métrica por intervalos discretos (ej: por día de la semana, por franja horaria).

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `type` | string | ✅ Sí | Tipo de target | - |
| `id` / `year` / `value` | varies | Condicional | Según el tipo | - |
| `dimension` | string | ❌ No | `weekday`, `hour` | `weekday` |
| `metric` | string | ❌ No | Métrica a analizar | `absent` |
| `from` | string | ❌ No | Fecha inicio | - |
| `to` | string | ❌ No | Fecha fin | - |

#### Ejemplo de Request
```http
GET /api/v1/stats/intervals?type=CLASSROOM&id=5&dimension=weekday&metric=absent
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK - Análisis por intervalos
```json
{
  "success": true,
  "dimension": "weekday",
  "metric": "absent",
  "list": [
    {
      "bucket": "0",
      "value": 8,
      "counts": {
        "total": 120,
        "present": 110,
        "absent": 8,
        "justified": 2,
        "withdrawn": 0,
        "events": {
          "late": 5,
          "early": 3,
          "justifications": 2,
          "manualAdjusts": 0
        }
      }
    },
    {
      "bucket": "1",
      "value": 5,
      "counts": {
        "total": 118,
        "present": 111,
        "absent": 5,
        "justified": 2,
        "withdrawn": 0,
        "events": {
          "late": 4,
          "early": 2,
          "justifications": 2,
          "manualAdjusts": 0
        }
      }
    },
    {
      "bucket": "4",
      "value": 12,
      "counts": {
        "total": 115,
        "present": 101,
        "absent": 12,
        "justified": 2,
        "withdrawn": 0,
        "events": {
          "late": 8,
          "early": 5,
          "justifications": 2,
          "manualAdjusts": 0
        }
      }
    }
  ]
}
```

**Nota sobre buckets**:
- **weekday**: `0`=Lunes, `1`=Martes, `2`=Miércoles, `3`=Jueves, `4`=Viernes, `5`=Sábado, `6`=Domingo
- **month**: `1`=Enero, `2`=Febrero, ..., `12`=Diciembre
- **hour**: `0`-`23` (hora del día en formato 24h)

#### Códigos de Estado
- `200` - Análisis exitoso
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Mapa de Calor

#### `GET /api/v1/stats/heatmap`

Genera un mapa de calor 2D cruzando dos dimensiones.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `type` | string | ✅ Sí | Tipo de target | - |
| `id` / `year` / `value` | varies | Condicional | Según el tipo | - |
| `x` | string | ❌ No | Dimensión eje X: `weekday`, `month`, `hour` | `weekday` |
| `y` | string | ❌ No | Dimensión eje Y: `weekday`, `month`, `hour` | `month` |
| `metric` | string | ❌ No | Métrica a visualizar | `absent` |
| `from` | string | ❌ No | Fecha inicio | - |
| `to` | string | ❌ No | Fecha fin | - |

#### Ejemplo de Request
```http
GET /api/v1/stats/heatmap?type=CLASSROOM&id=5&x=weekday&y=month&metric=absent
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK - Mapa de calor generado
```json
{
  "success": true,
  "x": "weekday",
  "y": "month",
  "metric": "absent",
  "cells": [
    {
      "x": "0",
      "y": "3",
      "value": 2,
      "counts": {
        "total": 15,
        "present": 13,
        "absent": 2,
        "justified": 0,
        "withdrawn": 0,
        "events": {
          "late": 1,
          "early": 0,
          "justifications": 0,
          "manualAdjusts": 0
        }
      }
    },
    {
      "x": "1",
      "y": "3",
      "value": 1,
      "counts": {
        "total": 16,
        "present": 15,
        "absent": 1,
        "justified": 0,
        "withdrawn": 0,
        "events": {
          "late": 0,
          "early": 1,
          "justifications": 0,
          "manualAdjusts": 0
        }
      }
    },
    {
      "x": "0",
      "y": "4",
      "value": 3,
      "counts": {
        "total": 14,
        "present": 11,
        "absent": 3,
        "justified": 0,
        "withdrawn": 0,
        "events": {
          "late": 2,
          "early": 1,
          "justifications": 0,
          "manualAdjusts": 0
        }
      }
    }
  ]
}
```

**Nota sobre coordenadas**:
- Los valores de `x` e `y` son **strings numéricos** que representan:
  - **weekday**: `"0"`=Lunes ... `"6"`=Domingo
  - **month**: `"1"`=Enero ... `"12"`=Diciembre
  - **day**: `"1"`-`"31"` (día del mes)
  - **hour**: `"0"`-`"23"` (hora del día)
- Cada celda contiene el valor calculado de la métrica y el desglose completo de contadores

#### Códigos de Estado
- `200` - Mapa generado exitosamente
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Dispersión

#### `GET /api/v1/stats/dispersion`

Calcula estadísticas de dispersión (media, mediana, desviación estándar, etc.) para un conjunto de entidades.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `scope` | string | ❌ No | Alcance: `STUDENT`, `CLASSROOM` | `STUDENT` |
| `type` | string | ✅ Sí | Tipo de target contenedor | - |
| `id` / `year` / `value` | varies | Condicional | Según el tipo | - |
| `metric` | string | ❌ No | Métrica a analizar | `attendancePct` |

#### Ejemplo de Request
```http
GET /api/v1/stats/dispersion?scope=STUDENT&type=CLASSROOM&id=5&metric=attendancePct
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK - Estadísticas calculadas
```json
{
  "success": true,
  "metric": "attendancePct",
  "count": 25,
  "mean": 0.942,
  "median": 0.95,
  "p90": 0.98,
  "stddev": 0.035
}
```

**Nota sobre estadísticas**:
- **`count`**: Número de entidades analizadas (estudiantes o aulas según `scope`)
- **`mean`**: Media aritmética de la métrica
- **`median`**: Valor mediano (50º percentil)
- **`p90`**: Percentil 90 (top 10%)
- **`stddev`**: Desviación estándar (dispersión de los datos)
- Todos los valores pueden ser `null` si no hay datos suficientes

#### Códigos de Estado
- `200` - Estadísticas calculadas
- `400` - Parámetros inválidos
- `401` - No autenticado

---

### Mejoras

#### `GET /api/v1/stats/improvements`

Identifica las entidades con mayor mejora en una métrica durante un período.

**Autenticación**: ✅ Requerida

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `scope` | string | ❌ No | Alcance: `STUDENT`, `CLASSROOM` | `STUDENT` |
| `type` | string | ✅ Sí | Tipo de target contenedor | - |
| `id` / `year` / `value` | varies | Condicional | Según el tipo | - |
| `metric` | string | ❌ No | Métrica a analizar | `attendancePct` |
| `windowDays` | number | ❌ No | Ventana de tiempo en días | `30` |
| `limit` | number | ❌ No | Top N resultados | `10` |

#### Ejemplo de Request
```http
GET /api/v1/stats/improvements?scope=STUDENT&type=CLASSROOM&id=5&metric=attendancePct&windowDays=30&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Respuesta

##### ✅ 200 OK - Ranking de mejoras
```json
{
  "success": true,
  "scope": "STUDENT",
  "metric": "attendancePct",
  "windowDays": 30,
  "limit": 5,
  "list": [
    {
      "id": 42,
      "prev": 0.85,
      "curr": 0.95,
      "delta": 0.10
    },
    {
      "id": 38,
      "prev": 0.885,
      "curr": 0.962,
      "delta": 0.077
    },
    {
      "id": 51,
      "prev": 0.90,
      "curr": 0.96,
      "delta": 0.06
    },
    {
      "id": 29,
      "prev": 0.88,
      "curr": 0.93,
      "delta": 0.05
    },
    {
      "id": 47,
      "prev": 0.92,
      "curr": 0.965,
      "delta": 0.045
    }
  ]
}
```

**Nota sobre el cálculo**:
- **Ventana anterior**: Desde `(ahora - 2*windowDays)` hasta `(ahora - windowDays)`
- **Ventana actual**: Desde `(ahora - windowDays)` hasta `ahora`
- **`prev`**: Valor de la métrica en la ventana anterior
- **`curr`**: Valor de la métrica en la ventana actual
- **`delta`**: Mejora = `curr - prev` (valores positivos = mejora, negativos = empeoramiento)
- La lista está ordenada por mayor `delta` (mayor mejora primero)

**Importante**: Los IDs retornados corresponden a `student_id` o `classroom_id` según el `scope` seleccionado.

#### Códigos de Estado
- `200` - Ranking generado
- `400` - Parámetros inválidos
- `401` - No autenticado

---

## Casos de Uso Comunes

### 1. Dashboard de Aula
```http
# Métricas generales del aula
POST /api/v1/stats/query
{ "target": { "type": "CLASSROOM", "id": 5 } }

# Top estudiantes con mejor asistencia
GET /api/v1/stats/rankings?scope=STUDENT&metric=attendancePct&limit=10

# Evolución mensual de asistencia
GET /api/v1/stats/timeseries?type=CLASSROOM&id=5&granularity=month&metric=attendancePct
```

### 2. Comparación de Turnos
```http
POST /api/v1/stats/compare
{
  "targets": [
    { "type": "SHIFT", "value": "MORNING" },
    { "type": "SHIFT", "value": "AFTERNOON" }
  ]
}
```

### 3. Análisis de Ausentismo por Día de Semana
```http
GET /api/v1/stats/intervals?type=YEAR&year=1&dimension=weekday&metric=absent
```

### 4. Identificar Estudiantes con Mejora
```http
GET /api/v1/stats/improvements?scope=STUDENT&type=CLASSROOM&id=5&metric=attendancePct&windowDays=60
```

---

## Códigos de Estado

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Consulta exitosa |
| `400` | Bad Request | Target inválido, parámetros faltantes o incorrectos |
| `401` | Unauthorized | Token faltante o inválido |
| `500` | Internal Server Error | Error en cálculo de estadísticas |

---

## Notas Técnicas

### Optimización de Consultas
- Las métricas se calculan en tiempo real desde la base de datos
- Se recomienda usar filtros de fecha (`from`, `to`) para consultas grandes
- Los rankings están limitados a 100 resultados máximo

### Caché
- Las estadísticas NO están cacheadas (siempre datos en tiempo real)
- Para dashboards con alta carga, considerar implementar caché en frontend

### Precisión
- Los porcentajes se redondean a 1 decimal
- Las fracciones de ausencia consideran tardanzas y salidas tempranas
- Los cálculos excluyen días no escolares automáticamente

---

**Última actualización**: 11 de noviembre de 2025  
**Versión API**: v1
