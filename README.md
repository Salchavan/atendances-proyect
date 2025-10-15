# Sistema de Gestión de Asistencias

Proyecto web para la gestión y visualización de asistencias e inasistencias de estudiantes, desarrollado con React, TypeScript, Zustand, Material UI y Vite, con estilos utilitarios en TailwindCSS.

Enlaces útiles:

- Investigación y planeamiento (Google Drive): https://drive.google.com/drive/folders/10pSfk91P3cLEVyq0M5MEtGYLI6GSyrvv?usp=sharing
- Demo (GH Pages): https://salchavan.github.io/atendances-proyect/

## Características principales

- Calendario mensual (solo vista de mes):

  - 5 semanas fijas que ocupan el alto y ancho disponible del contenedor.
  - Navegación de meses (anterior / siguiente).
  - “Hoy” resaltado con ring azul más grueso.
  - Fines de semana con fondo más oscuro.
  - Totales de inasistencias por día en el centro (ocultos en sábados y domingos).
  - Tooltip apilado en hover con total, justificadas y no justificadas (con indicadores de color).
  - Click en un día abre un modal con un DataTable de quienes faltaron ese día.
  - Totalmente estilizado con Tailwind. Props para personalizar colores de texto/números/fondo.

- Gráfico dinámico (DynamicGraph):

  - Inicializa automáticamente mostrando los últimos 5 días laborales si no hay selección (evita pantalla en blanco).
  - Modos de vista: cada día, promedios; con partición (día/semana/mes/año) donde aplica.
  - Usa altura disponible del contenedor (mide toolbar y ajusta el gráfico para evitar recortes).
  - Barras con colores originales (paleta por defecto de X-Charts).

- Tabla de datos (DataTable):

  - Búsqueda y filtros (debounce, insensitive a acentos).
  - Se adapta al alto del contenedor (flex + ResizeObserver).
  - Al hacer click en un registro: guarda estudiante seleccionado en store y navega a Perfil.
  - Separado en UI, lógica y subcomponentes (toolbar + tabla rsuite).

- Rutas y navegación:

  - Rutas protegidas (RequireAuth) y estructura anidada bajo /home.
  - Clase seleccionada con ruta dinámica: /home/classrooms/:id.
  - Hook de navegación custom (useNavigateTo), seguro con Router context.

- Páginas de Clases (Classrooms):

  - Listado de aulas como cartas con formato “7º "F"”, turno, cantidad de estudiantes y especialidad (si aplica).
  - Generador de aulas (genClassrooms.ts): todas las combinaciones year × char; A/B/C = Mañana, D/E/F = Tarde.
  - Detalle de clase con layout en 4 cuadrantes:
    1. Imagen + título + detalles + notas
    2. DataTable
    3. DynamicGraph
    4. DataTable

- Estado global y persistente con Zustand:

  - Stores para gráfico, tabla, alertas, usuario, etc.
  - Modal global para abrir DataTable desde el calendario y el gráfico.

- Autenticación y datos:
  - users.json actualizado al nuevo formato:
    - { id, firstName, lastName, email, password, rol }
  - Adaptación de UI y lógica al nuevo shape (fallbacks para legacy donde aplica).

## Estructura del proyecto (resumen)

```
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── tailwindStyles.css
│   ├── components/
│   │   ├── Calendar/
│   │   │   ├── Calendar.tsx            (UI)
│   │   │   ├── Calendar.logic.ts       (lógica)
│   │   │   ├── DayCell.tsx             (subcomponentes)
│   │   │   └── … (tooltip, helpers)
│   │   ├── DynamicGraph/
│   │   │   ├── DynamicGraph.tsx        (UI)
│   │   │   ├── DynamicGraph.logic.ts   (lógica)
│   │   │   ├── DynamicGraphToolbar.tsx (subcomponentes)
│   │   │   └── DynamicGraphChart.tsx   (subcomponentes)
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx           (UI)
│   │   │   ├── DataTable.logic.ts      (lógica)
│   │   │   └── RsuiteDataTable.tsx     (subcomponentes)
│   │   ├── CustomModal.tsx
│   │   └── AsideEvents.tsx
│   ├── Pages/
│   │   ├── Home.tsx
│   │   ├── Classrooms/
│   │   │   ├── IndexClassroomsPage.tsx
│   │   │   └── ClassroomPage.tsx
│   │   └── Perfil.tsx
│   ├── data/
│   │   ├── Students.json
│   │   ├── users.json
│   │   └── genClassrooms.ts
│   ├── store/
│   │   ├── Store.ts
│   │   ├── GraphStore.ts
│   │   ├── CachedStore.ts
│   │   ├── DataTableStore.ts
│   │   └── UserStore.ts
│   └── Logic.ts (useNavigateTo hook)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Instalación y ejecución

1. Clonar e instalar:

```sh
git clone https://github.com/Salchavan/atendances-proyect.git
cd atendances-proyect
npm install
```

2. Dev server:

```sh
npm run dev
```

Abrir http://localhost:5173 (Vite mostrará el puerto si es distinto).

3. Build:

```sh
npm run build
```

## Notas de enrutado y despliegue

- La app usa BrowserRouter con basename para GH Pages: /atendances-proyect
- Rutas destacadas:
  - /login (pública)
  - /home (layout + privadas)
    - /home/classrooms (listado)
    - /home/classrooms/:id (detalle dinámico)
    - /home/perfil (perfil)
    - /home/config (configuración)
- Si abres modales globales con contenido que usa useNavigate, asegúrate de que el modal esté bajo el Router (App.tsx ya lo hace).

## Datos y formatos

- users.json:
  - { id: number, firstName: string, lastName: string, email: string, password: string, rol: number }
- Students.json:
  - Estudiantes con unassistences: { day: 'dd-mm-yy', isJustified: boolean }
  - El calendario agrega totales por fecha y abre un DataTable detallado al click.
- genClassrooms.ts:
  - Genera combinaciones (year × char) con turn derivado (A/B/C = Mañana, D/E/F = Tarde).

## Personalización

- Estilos utilitarios: src/tailwindStyles.css y clases en componentes (Calendar, Classrooms, etc.).
- DynamicGraph: puedes ocultar la toolbar con prop toolbarEnabled={false} y controla su layout con grid y contenedores h-full/min-h-0.
- DataTable: ajusta columnas y filtros en DataTable.logic.

## MultiChart

Componente de gráficos unificado que reemplaza y amplía DynamicGraph. Usa Material UI + X-Charts y soporta barras apiladas, torta y líneas, selección de rango por fechas y pantalla completa con el modal global.

Ubicación:

- `src/components/MultiChart/`
  - `MultiChart.tsx` (contenedor + fullscreen via CustomModal)
  - `MultiChart.logic.ts` (estado, datos y helpers)
  - `MultiChartToolbar.tsx` (toolbar con rango, tipo de gráfico y menú de series)
  - `MultiChartChart.tsx` (render de Bar/Pie/Line)

Uso básico:

```tsx
import { MultiChart } from '@/components/MultiChart/MultiChart';

<MultiChart title='Asistencias' grid='col-span-2 row-span-2' />;
```

Props principales:

- `title?: string`
  - Texto del encabezado de la toolbar.
- `grid?: string`
  - Clase(s) para integrarse al grid del contenedor padre.
- `toolbarEnabled?: boolean` (default: true)
  - Muestra/oculta la toolbar.
- `disabledControls?: { date?: boolean; chartType?: boolean; series?: boolean; fullscreen?: boolean }`
  - Deshabilita selectivamente controles de la toolbar.

Características:

- Tipos de gráfico: `bar`, `pie`, `line`.
- Barras apiladas para "Justificadas" y "Injustificadas"; la serie "Total" no se apila.
- Rango de fechas con MUI Date Pickers (AdapterDateFns). Si no hay rango, se usan los últimos días hábiles disponibles.
- Menú compacto para activar/desactivar series (Total, Justificadas, Injustificadas).
- Pantalla completa usando `CustomModal` tamaño "big"; se reutiliza una versión compacta de la toolbar dentro del modal.

Notas de datos:

- Los datos provienen de `public/data/Students.json`. La lógica agrega por días de la semana dentro del rango seleccionado y calcula totales/justificadas/no justificadas.

Consejos de layout:

- El alto del gráfico es responsivo mediante `ResizeObserver`. Asegúrate de que el contenedor tenga `min-height: 0` para evitar recortes y que el gráfico pueda ocupar el alto disponible.

### Props de DynamicGraph

Uso básico:

```tsx
<DynamicGraph
  graphName='Asistencias'
  grid='col-span-2 row-span-2' // clases o nombre de grid del padre
  toolbarEnabled={true}
  initialAssignedDate={null}
/>
```

Props disponibles:

- graphName: string (requerido)
  - Nombre que se muestra en el título: “Gráfico de {graphName}”.
- grid: string (requerido)
  - Clase(s) o identificador que se aplica como className al contenedor para integrarlo en tu grid/layout.
- initialAssignedDate?: Date[] | null (opcional; por defecto null)
  - Fechas preasignadas que el gráfico usará al iniciar. Si no hay fechas (o la selección resulta vacía), el componente selecciona automáticamente los últimos 5 días laborables para evitar pantalla en blanco.
- toolbarEnabled?: boolean (opcional; por defecto true)
  - Muestra/oculta la toolbar (rango de fechas, modos de vista y partición). Al desactivarla, el gráfico ocupa el alto disponible igualmente.

Notas:

- Altura: el gráfico ocupa el 100% del alto restante del contenedor y se recalcula con ResizeObserver para evitar recortes.
- Tipografías: el gráfico fuerza una fuente del sistema para mantener legibilidad y no verse afectado por cambios globales de tipografía.

## Troubleshooting

- “Invalid hook call” o “useNavigate fuera de Router”:
  - Asegúrate de usar el hook useNavigateTo dentro de componentes.
  - Verifica que cualquier modal que use navegación esté dentro del Router.
- Gráficos recortados:
  - Revisa contenedores con h-full y min-h-0; evita padding extra en el CardContent del gráfico.

## Licencia

Sin licencia explícita definida. Consulta al autor si vas a reutilizar o distribuir.

¿Dudas o sugerencias? Revisa el documento de planeamiento o abre un issue/PR.
