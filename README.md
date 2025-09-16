# Sistema de Gestión de Asistencias

Proyecto web para la gestión y visualización de asistencias e inasistencias de estudiantes, desarrollado con React, TypeScript, Zustand, Material UI y Vite.

## Características principales

- Visualización de inasistencias por rangos de fechas, con filtros por día, semana, mes y año.
- Gráficos interactivos de barras con promedios y desglose de faltas justificadas/injustificadas.
- Tabla de datos filtrable y buscable (con soporte para acentos y búsqueda multi-palabra).
- Perfil de usuario con detalles y opción de copiar datos.
- Estado global y persistente con Zustand.
- UI responsiva y moderna con Material UI y TailwindCSS.

## Estructura del proyecto

```
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── tailwindStyles.css
│   ├── components/
│   │   ├── DynamicGraph.tsx
│   │   ├── DataTable.tsx
│   │   ├── CustomModal.tsx
│   │   └── ...
│   ├── data/
│   │   └── Data.ts
│   ├── login/
│   ├── main/
│   ├── store/
│   │   ├── Store.ts
│   │   ├── GraphStore.ts
│   │   ├── CachedStore.ts
│   │   └── DataTableStore.ts
│   └── ...
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Instalación y ejecución

1. Clona el repositorio:
   ```sh
   git clone https://github.com/Salchavan/atendances-proyect.git
   cd atendances-proyect
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```
4. Abre la app en [http://localhost:5173](http://localhost:5173) (o el puerto que indique Vite).

## Principales dependencias

- React + TypeScript
- Zustand (manejo de estado global y persistente)
- Material UI (componentes de interfaz)
- TailwindCSS (estilos utilitarios)
- rsuite (DateRangePicker)
- date-fns (utilidades de fechas)

## Funcionalidades destacadas

- **Gráfico dinámico:**
  - Permite seleccionar el rango de fechas y la partición (por día, semana, mes, año).
  - Muestra promedios de faltas justificadas e injustificadas apiladas.
  - Interacción para ver detalles en tabla.
- **Tabla de datos:**
  - Filtros avanzados, búsqueda insensible a acentos y mayúsculas.
  - Debounce en búsqueda global.
- **Perfil de usuario:**
  - Visualización de datos y copia rápida al portapapeles.
- **Gestión de estado:**
  - Separación de stores para lógica de gráfico, tabla, alertas y perfil.

## Personalización y desarrollo

- Puedes modificar los datos de ejemplo en `src/data/Data.ts`.
- Los estilos globales están en `src/tailwindStyles.css`.
- La lógica de filtros y stores está en `src/store/`.

## ¿Preguntas o mejoras?

Si necesitas información sobre variables de entorno, despliegue, integración con backend o tienes sugerencias, ¡consúltame!
