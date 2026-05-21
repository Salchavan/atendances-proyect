# Arquitectura del Sistema Backend para Gestión de Asistencia Escolar

## Capítulo I: Introducción y Fundamentos Tecnológicos

### 1.1 Contexto y Alcance del Sistema

El presente documento técnico describe detalladamente la arquitectura del sistema backend desarrollado para la modernización y automatización del proceso de control de asistencia en instituciones educativas. Este sistema representa una solución tecnológica integral que transforma los métodos tradicionales de registro manual de asistencia en un proceso digitalizado, eficiente y confiable.

El backend, término técnico que se refiere a la "parte trasera" o "lado del servidor" de una aplicación, constituye el componente fundamental que opera detrás de escena para procesar, almacenar y gestionar toda la información del sistema. A diferencia del frontend (la interfaz visual con la que interactúan directamente los usuarios), el backend se ejecuta en servidores y es responsable de la lógica de negocio, el procesamiento de datos, la seguridad y la integridad de la información.

Este sistema backend fue diseñado específicamente para abordar las necesidades operativas de instituciones educativas de nivel medio, considerando los desafíos particulares que enfrentan: la necesidad de registrar asistencia de múltiples estudiantes simultáneamente, generar reportes estadísticos para análisis académico, mantener trazabilidad completa de todas las operaciones, y garantizar la seguridad e integridad de información sensible relacionada con menores de edad.

### 1.2 Fundamentación de la Elección Tecnológica

La arquitectura del sistema se fundamenta en **Node.js**, una plataforma de ejecución de JavaScript del lado del servidor que ha revolucionado el desarrollo backend en la última década. Para comprender esta elección tecnológica, es importante explicar qué es Node.js y por qué resulta particularmente adecuado para este tipo de sistema.

**Node.js** es un entorno de ejecución que permite ejecutar código JavaScript fuera del navegador web, específicamente en servidores. Tradicionalmente, JavaScript solo podía ejecutarse en navegadores web (frontend), pero Node.js extendió sus capacidades al ámbito del servidor (backend). Esta plataforma fue creada en 2009 por Ryan Dahl y se basa en el motor V8 de Google Chrome, conocido por su excepcional rendimiento.

La decisión de utilizar Node.js para este proyecto se fundamenta en cuatro pilares principales:

**1. Modelo de Entrada/Salida No Bloqueante (Asíncrono):**

Node.js implementa un modelo de procesamiento asíncrono que resulta fundamental para un sistema de asistencia escolar. Cuando decenas o cientos de usuarios intentan registrar asistencia simultáneamente al inicio de una jornada escolar, un servidor tradicional procesaría estas solicitudes una tras otra (modelo síncrono), generando demoras significativas. En contraste, Node.js puede recibir y procesar múltiples solicitudes concurrentemente sin bloquear el sistema.

Para ilustrar este concepto con una analogía cotidiana: imagine un cajero de banco tradicional (modelo síncrono) que atiende completamente a un cliente antes de pasar al siguiente, versus un sistema de tickets (modelo asíncrono) donde se toman todos los pedidos simultáneamente y se procesan a medida que se completan. Node.js opera con este segundo enfoque, permitiendo que el sistema mantenga su capacidad de respuesta incluso bajo alta concurrencia de usuarios.

**2. JavaScript Unificado en Todo el Stack:**

La utilización del mismo lenguaje de programación (JavaScript) tanto en el frontend como en el backend simplifica significativamente el desarrollo, mantenimiento y evolución del sistema. Los desarrolladores pueden trabajar en ambas capas de la aplicación sin necesidad de cambiar de lenguaje, lo que reduce la complejidad cognitiva y acelera el proceso de desarrollo.

Esta unificación también facilita la reutilización de código. Por ejemplo, las funciones de validación de datos (como verificar que una fecha esté en formato correcto o que un número de documento sea válido) pueden escribirse una sola vez y utilizarse tanto en el frontend como en el backend, garantizando consistencia y reduciendo duplicación de esfuerzos.

**3. Ecosistema NPM (Node Package Manager):**

Node.js cuenta con NPM, el repositorio de paquetes de software más grande del mundo, con más de 2 millones de paquetes disponibles. Esto significa que para casi cualquier funcionalidad que el sistema necesite implementar (envío de correos electrónicos, generación de reportes PDF, procesamiento de imágenes para biometría, etc.), existe una biblioteca probada y mantenida por la comunidad que puede integrarse fácilmente al proyecto.

Esta abundancia de recursos reduce drásticamente el tiempo de desarrollo, ya que no es necesario "reinventar la rueda" programando desde cero funcionalidades que ya han sido resueltas y optimizadas por otros desarrolladores.

**4. Escalabilidad Horizontal:**

La arquitectura de Node.js facilita la escalabilidad horizontal, es decir, la capacidad de distribuir la carga de trabajo entre múltiples servidores. Si una institución educativa crece y necesita procesar más solicitudes, es relativamente sencillo agregar más servidores que trabajen en conjunto, distribuyendo la carga entre ellos.

Esta característica es particularmente relevante para instituciones educativas que pueden tener picos de demanda muy marcados (por ejemplo, todos los estudiantes ingresando a primera hora de la mañana) y períodos de baja actividad (durante el horario de clases). El sistema puede ajustar dinámicamente sus recursos según la demanda.

### 1.3 Express.js: El Framework de Aplicación Web

Sobre Node.js se construye la aplicación utilizando **Express.js**, un framework (marco de trabajo) que proporciona la estructura y las herramientas necesarias para desarrollar aplicaciones web y APIs de manera eficiente y organizada.

Un framework es comparable a un esqueleto o andamiaje sobre el cual se construye una aplicación. Express.js proporciona componentes predefinidos para tareas comunes en el desarrollo web, como el manejo de solicitudes HTTP (el protocolo de comunicación de la web), la gestión de sesiones de usuario, el procesamiento de datos enviados por los clientes, y la organización del código en rutas lógicas.

Express.js se caracteriza por su filosofía minimalista y no opinionada. A diferencia de frameworks más rígidos que imponen una estructura específica, Express.js ofrece flexibilidad para que los desarrolladores organicen el código según las necesidades particulares del proyecto. Esta flexibilidad fue crucial para implementar la arquitectura de aplicaciones duales que se describirá más adelante.

Las ventajas específicas de Express.js para este proyecto incluyen:

- **Sistema de Middleware Modular:** Permite intercalar funcionalidades en el flujo de procesamiento de solicitudes de manera ordenada y reutilizable.
- **Routing Flexible:** Facilita la definición de cómo el sistema responde a diferentes solicitudes de los clientes.
- **Madurez y Estabilidad:** Con más de una década de desarrollo activo, es una tecnología probada y confiable.
- **Amplia Comunidad:** Existe abundante documentación, tutoriales y soluciones a problemas comunes.

### 1.4 Módulos ES (ES Modules): Organización Moderna del Código

Una característica distintiva de este proyecto es la utilización de **ES Modules** (ECMAScript Modules), el sistema de módulos estándar y moderno de JavaScript. Para comprender su importancia, es necesario explicar qué es un módulo y por qué la modularización es fundamental en el desarrollo de software.

Un **módulo** es una unidad de código independiente y reutilizable que encapsula funcionalidad específica. En lugar de escribir todo el código de una aplicación en un único archivo gigantesco e inmanejable, los módulos permiten dividir el código en archivos más pequeños, cada uno con una responsabilidad bien definida.

Para ilustrar este concepto, consideremos una analogía con una biblioteca física: en lugar de tener un solo libro enorme que contenga todo el conocimiento, una biblioteca organiza el conocimiento en múltiples libros especializados (módulos), cada uno dedicado a un tema específico. Cuando necesitamos información sobre un tema particular, sabemos exactamente qué libro consultar.

Históricamente, JavaScript utilizaba un sistema llamado **CommonJS** para la modularización en entornos Node.js. Sin embargo, ES Modules representa el estándar oficial de JavaScript y ofrece ventajas significativas:

**Importaciones Estáticas Analizables:**

Con ES Modules, el sistema puede determinar exactamente qué módulos necesita una aplicación antes de ejecutarla. Esto permite a las herramientas de desarrollo realizar optimizaciones automáticas, eliminar código no utilizado (tree-shaking), y detectar errores de dependencias antes de la ejecución.

En términos prácticos, si un módulo del sistema necesita funcionalidad de otro módulo, declara explícitamente esa dependencia mediante una sentencia de importación. El sistema puede entonces construir un "grafo de dependencias" completo y optimizar el proceso de carga.

**Exportaciones Explícitas y Seguridad:**

Los módulos ES requieren que se declare explícitamente qué funcionalidades se comparten con otros módulos. Todo lo que no se exporta explícitamente permanece privado dentro del módulo. Este encapsulamiento mejora la seguridad y previene efectos secundarios no deseados donde un módulo podría accidentalmente modificar variables de otro módulo.

**Compatibilidad y Futuro:**

ES Modules es el estándar oficial respaldado por el comité TC39 (el organismo que define las especificaciones de JavaScript). Esto garantiza soporte a largo plazo y compatibilidad con herramientas modernas de desarrollo. Además, los navegadores web modernos soportan ES Modules nativamente, facilitando potenciales migraciones o integraciones futuras.

**Sintaxis Clara y Legible:**

La sintaxis de ES Modules es más clara y declarativa que su predecesor CommonJS. Las sentencias `import` y `export` son explícitas y fáciles de entender, incluso para desarrolladores que se incorporan nuevos al proyecto.

### 1.5 Principios SOLID: Fundamentos de Arquitectura de Software

La arquitectura del sistema se adhiere rigurosamente a los **principios SOLID**, un acrónimo que representa cinco principios fundamentales del diseño orientado a objetos que mejoran la mantenibilidad, escalabilidad y comprensibilidad del software.

**S - Single Responsibility Principle (Principio de Responsabilidad Única):**

Este principio establece que cada módulo, clase o componente del sistema debe tener una única razón para cambiar, es decir, una única responsabilidad bien definida. En el contexto de este sistema, por ejemplo, existe un módulo dedicado exclusivamente a la autenticación de usuarios, otro dedicado al registro de asistencia, y otro al procesamiento biométrico. Cada uno tiene una responsabilidad clara y no se mezclan funcionalidades dispares.

La ventaja práctica de este principio es que cuando se necesita modificar o corregir una funcionalidad específica, se sabe exactamente dónde buscar en el código. Además, los cambios en un módulo tienen menor probabilidad de afectar inesperadamente a otros módulos, reduciendo el riesgo de introducir errores al realizar modificaciones.

**O - Open/Closed Principle (Principio Abierto/Cerrado):**

Este principio establece que el software debe estar "abierto para extensión, pero cerrado para modificación". En términos prácticos, significa que debe ser posible agregar nuevas funcionalidades sin modificar código existente que ya funciona correctamente.

En el sistema de asistencia, este principio se manifiesta en el diseño del motor de reportes. El sistema incluye varios tipos de reportes predefinidos (asistencia detallada, tendencias, alertas tempranas), pero si la institución necesita un nuevo tipo de reporte, este puede agregarse sin modificar los reportes existentes. Cada reporte es una "extensión" del sistema base.

**L - Liskov Substitution Principle (Principio de Sustitución de Liskov):**

Este principio, nombrado en honor a la científica computacional Barbara Liskov, establece que los objetos de un programa deben ser reemplazables por instancias de sus subtipos sin alterar la correctitud del programa. En términos más simples, si un componente del sistema espera trabajar con cierto tipo de objeto, debería poder trabajar con cualquier variante de ese objeto sin problemas.

En el sistema de asistencia, por ejemplo, el componente de almacenamiento de datos está diseñado para trabajar con cualquier base de datos compatible con el estándar SQL. Si en el futuro se decide migrar de PostgreSQL a MySQL, el cambio puede realizarse sin modificar la lógica de negocio que utiliza la base de datos.

**I - Interface Segregation Principle (Principio de Segregación de Interfaces):**

Este principio establece que ningún cliente (módulo que utiliza otro módulo) debería verse obligado a depender de métodos que no utiliza. En lugar de tener interfaces grandes y monolíticas con muchos métodos, es preferible tener múltiples interfaces específicas y pequeñas.

En el contexto del sistema, los servicios de auditoría no dependen de funcionalidades de procesamiento biométrico, aunque ambos operan sobre datos de estudiantes. Cada servicio expone solo la funcionalidad relevante para sus consumidores.

**D - Dependency Inversion Principle (Principio de Inversión de Dependencias):**

Este principio establece que los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones. Además, las abstracciones no deben depender de los detalles, sino al contrario.

En el sistema, la lógica de negocio (alto nivel) no depende directamente de cómo se almacenan los datos en la base de datos (bajo nivel). En su lugar, ambos dependen de una abstracción intermedia (el ORM Prisma, que se explicará en detalle posteriormente). Esto permite cambiar la implementación de almacenamiento sin afectar la lógica de negocio.

## Capítulo II: Arquitectura de Aplicaciones Duales

### 2.1 Concepto y Diseño de la Arquitectura Dual

Una de las decisiones arquitectónicas más significativas del sistema es la implementación de una **arquitectura de aplicaciones duales**. Esta estrategia consiste en dividir el sistema backend en dos aplicaciones independientes pero coordinadas, cada una ejecutándose en su propio proceso y puerto de red, con responsabilidades claramente diferenciadas.

Para comprender mejor este concepto, es útil compararlo con organizaciones del mundo real. Consideremos una institución bancaria que tiene dos departamentos completamente separados: uno dedicado exclusivamente a la seguridad (verificación de identidad, control de accesos, gestión de credenciales) y otro dedicado a las operaciones bancarias (transacciones, consultas de saldo, préstamos). Aunque ambos departamentos deben comunicarse y coordinarse, mantienen sus propias instalaciones, personal y procesos.

De manera análoga, el sistema de asistencia escolar se divide en:

**Aplicación Principal (Core Application):**

Esta aplicación constituye el núcleo operativo del sistema y se encarga de toda la lógica de negocio relacionada con el propósito fundamental del sistema: la gestión de asistencia escolar. Sus responsabilidades incluyen:

- Registro y actualización de registros de asistencia de estudiantes
- Gestión de información de estudiantes y sus inscripciones en aulas
- Procesamiento de eventos de ausencia (llegadas tarde, salidas tempranas, justificaciones)
- Generación de reportes estadísticos y analíticos
- Administración de configuraciones del sistema (años académicos, aulas, divisiones)
- Gestión del sistema biométrico de identificación
- Procesamiento de retiros autorizados de estudiantes

Esta aplicación se ejecuta en el puerto 3000 del servidor, que actúa como una "puerta de entrada" para las solicitudes relacionadas con operaciones de asistencia.

**Aplicación de Autenticación (Authentication Application):**

Esta aplicación está dedicada exclusivamente a la seguridad, autenticación y autorización de usuarios del sistema. Opera de manera completamente independiente y se encarga de:

- Verificación de credenciales de usuarios (proceso de login)
- Emisión y validación de tokens de autenticación JWT (que se explicará en detalle en capítulos posteriores)
- Gestión del ciclo de vida de sesiones de usuario
- Renovación de tokens de acceso mediante tokens de actualización (refresh tokens)
- Provisión de claves públicas para verificación de tokens (JWKS - JSON Web Key Set)
- Cierre de sesión y revocación de tokens

Esta aplicación se ejecuta en el puerto 3001, completamente aislada de la aplicación principal, lo que proporciona una capa adicional de seguridad.

### 2.2 Justificación y Ventajas de la Separación

La decisión de implementar una arquitectura dual en lugar de una única aplicación monolítica se fundamenta en múltiples beneficios técnicos y operativos:

**Aislamiento de Seguridad:**

Al mantener la lógica de autenticación completamente separada, se crea una barrera adicional de seguridad. Si existiera una vulnerabilidad en la aplicación principal (por ejemplo, en el procesamiento de reportes), un atacante no tendría acceso directo al sistema de autenticación. Las credenciales de usuario, los algoritmos de generación de tokens y las claves de cifrado están protegidos en una aplicación independiente.

Además, esto permite aplicar políticas de seguridad más estrictas específicamente a la aplicación de autenticación. Por ejemplo, se pueden configurar límites más restrictivos de intentos de login fallidos, implementar medidas adicionales de detección de intrusos, o requerir autenticación multifactor exclusivamente para operaciones de autenticación.

**Escalabilidad Independiente y Optimización de Recursos:**

Las dos aplicaciones tienen patrones de uso muy diferentes. La aplicación principal experimenta picos de actividad durante los horarios de ingreso y salida escolar, cuando muchos usuarios registran asistencia simultáneamente. En contraste, la aplicación de autenticación experimenta actividad principalmente al inicio de la jornada laboral cuando los usuarios inician sesión, y luego su uso disminuye significativamente.

Esta diferencia en los patrones de uso permite escalar cada aplicación independientemente. Durante los picos de registro de asistencia, se pueden asignar más recursos (memoria, procesamiento) a la aplicación principal sin necesidad de escalar también la aplicación de autenticación. Esto optimiza el uso de recursos del servidor y reduce costos operativos.

En términos prácticos, si el sistema se ejecuta en servicios de computación en la nube (como Amazon Web Services, Google Cloud o Microsoft Azure), esta arquitectura permite pagar solo por los recursos realmente necesarios para cada aplicación en cada momento.

**Mantenimiento y Actualizaciones Sin Interrupciones:**

La separación permite realizar actualizaciones o mantenimiento en una aplicación sin necesariamente afectar a la otra. Por ejemplo, si se necesita actualizar la lógica de generación de reportes en la aplicación principal, esta puede reiniciarse para aplicar los cambios mientras la aplicación de autenticación continúa operando normalmente.

Los usuarios que ya tienen sesiones activas pueden continuar trabajando sin interrupción, ya que sus tokens de autenticación siguen siendo válidos y la aplicación de autenticación permanece disponible para validarlos.

**Preparación para Arquitectura de Microservicios:**

Esta arquitectura dual representa un primer paso hacia una posible evolución futura hacia microservicios, un patrón arquitectónico donde una aplicación se compone de múltiples servicios pequeños e independientes que se comunican entre sí.

Si en el futuro la institución decide expandir el sistema (por ejemplo, agregando módulos de gestión académica, comunicación con padres, o administración de bibliotecas), la experiencia y estructura ya establecida facilitan la adición de nuevos servicios independientes que se integran con los existentes.

**Disponibilidad y Tolerancia a Fallos:**

En el escenario poco probable de que una aplicación falle por un error de programación o problema de recursos, la otra puede continuar operando. Por ejemplo, si la aplicación principal experimenta un fallo temporal, los usuarios aún pueden autenticarse en el sistema (aunque no puedan realizar operaciones hasta que se restaure la aplicación principal).

Esta separación también facilita la implementación de estrategias de recuperación ante desastres y respaldo, donde cada aplicación puede tener su propia estrategia de backup y restauración.

## Capítulo III: Patrón Arquitectónico Modelo-Vista-Controlador (MVC)

### 3.1 Fundamentos del Patrón MVC

El sistema implementa el patrón arquitectónico **Modelo-Vista-Controlador (MVC)**, uno de los patrones de diseño más establecidos y ampliamente utilizados en el desarrollo de aplicaciones. Este patrón fue concebido originalmente en la década de 1970 por Trygve Reenskaug mientras trabajaba en Xerox PARC, y desde entonces se ha convertido en un estándar de la industria.

El objetivo fundamental del patrón MVC es lograr la **separación de responsabilidades** (Separation of Concerns), un principio de diseño que establece que un sistema debe organizarse en componentes distintos, donde cada componente se encarga de un aspecto específico de la funcionalidad. Esta separación facilita enormemente el mantenimiento, la evolución y la comprensibilidad del software.

Para explicar el patrón MVC de manera accesible, consideremos la analogía de un restaurante:

- El **Modelo** es como la cocina del restaurante: donde se almacenan los ingredientes (datos) y donde se conocen las recetas y procedimientos culinarios (lógica de negocio). La cocina mantiene el inventario y sabe cómo preparar cada plato según las reglas establecidas.

- La **Vista** es como el menú y la presentación de los platos: cómo se muestra la información a los comensales. El menú presenta las opciones disponibles de forma comprensible y atractiva.

- El **Controlador** es como el mesero: recibe los pedidos de los comensales (solicitudes del usuario), los comunica a la cocina (modelo), y trae los platos preparados para presentarlos adecuadamente (vista).

### 3.2 La Capa Modelo: Persistencia y Lógica de Negocio

En el sistema de asistencia escolar, la **capa Modelo** está implementada mediante dos componentes principales: los servicios de lógica de negocio y el sistema de persistencia de datos basado en **Prisma ORM**.

**Lógica de Negocio en Servicios:**

Los servicios contienen todas las reglas y operaciones específicas del dominio escolar. Por ejemplo, el servicio de asistencia conoce y aplica reglas como:

- Un estudiante solo puede tener un registro de asistencia por día
- Solo se puede registrar asistencia para estudiantes que estén activamente inscritos en el aula correspondiente
- La fecha de asistencia debe estar dentro del período académico activo
- Las ausencias parciales (fracciones) deben sumar correctamente según los eventos registrados
- No se pueden modificar registros de asistencia de años académicos que han sido cerrados

Estas reglas de negocio están codificadas en los servicios, separadas completamente de cómo se presenta la información o cómo se almacena en la base de datos.

**Prisma ORM como Capa de Persistencia:**

**ORM** es un acrónimo de **Object-Relational Mapping** (Mapeo Objeto-Relacional), un patrón de diseño que soluciona el problema de la "impedancia" entre dos paradigmas diferentes: el paradigma orientado a objetos de los lenguajes de programación y el paradigma relacional de las bases de datos.

Para explicar este concepto, consideremos que los programas modernos trabajan con "objetos" (entidades con propiedades y comportamientos, como un objeto "Estudiante" con propiedades nombre, apellido, DNI, etc.), mientras que las bases de datos relacionales trabajan con "tablas" y "filas". Un ORM actúa como traductor entre estos dos mundos, permitiendo que el programa trabaje con objetos mientras automáticamente se encarga de almacenarlos y recuperarlos de la base de datos relacional.

Prisma ORM, específicamente, ofrece varias ventajas fundamentales:

**Tipo-Seguridad (Type Safety):**

Prisma genera automáticamente tipos de datos para cada entidad del sistema basándose en el esquema de la base de datos. Esto significa que si un programador intenta acceder a un campo que no existe o usar un tipo de dato incorrecto, el error se detecta inmediatamente durante el desarrollo, antes incluso de ejecutar el programa.

Por ejemplo, si el sistema intenta guardar texto en un campo que debe contener un número, Prisma detecta el error y lo señala al programador inmediatamente, previniendo errores en producción.

**Migraciones Versionadas:**

Prisma mantiene un historial completo de todos los cambios realizados en la estructura de la base de datos. Cada vez que se modifica el esquema (por ejemplo, agregando un nuevo campo a la tabla de estudiantes), Prisma genera una "migración" que documenta exactamente qué cambió y cuándo.

Este sistema de migraciones permite:
- Aplicar los mismos cambios de manera consistente en diferentes ambientes (desarrollo, pruebas, producción)
- Revertir cambios si algo sale mal
- Mantener sincronizados múltiples servidores
- Documentar automáticamente la evolución del esquema de datos

**Construcción de Consultas Fluida:**

Prisma proporciona una sintaxis intuitiva y legible para realizar consultas a la base de datos. En lugar de escribir consultas SQL textuales (que son propensas a errores y vulnerabilidades de seguridad), se utiliza una interfaz de programación que es verificada en tiempo de desarrollo.

### 3.3 La Capa Vista: APIs REST y Formato JSON

En aplicaciones web tradicionales, la vista se refiere a las páginas HTML que el usuario ve en su navegador. Sin embargo, en el contexto de este sistema backend, la "vista" adopta una forma diferente: **APIs REST que devuelven datos en formato JSON**.

**REST (Representational State Transfer):**

REST es un estilo arquitectónico para diseñar servicios web que define un conjunto de restricciones y principios para crear APIs escalables y mantenibles. Una API (Application Programming Interface - Interfaz de Programación de Aplicaciones) es esencialmente un "contrato" que define cómo diferentes componentes de software pueden comunicarse entre sí.

Los principios fundamentales de REST que aplica el sistema incluyen:

**Recursos Identificables:** Cada entidad del sistema (estudiante, asistencia, aula) es un "recurso" accesible mediante una dirección única. Por razones de seguridad, no se documentan las direcciones específicas en este documento, pero conceptualmente cada tipo de recurso tiene su propia ubicación en el sistema.

**Operaciones Estándar mediante Verbos HTTP:** REST utiliza los métodos HTTP estándar para indicar qué operación se desea realizar:
- GET: Recuperar información (lectura)
- POST: Crear nuevos registros
- PUT/PATCH: Actualizar registros existentes
- DELETE: Eliminar registros

**Estado sin Sesión:** Cada solicitud al servidor contiene toda la información necesaria para procesarla, sin depender de información almacenada en sesiones del servidor. Esto facilita la escalabilidad y distribución de carga.

**Formato JSON:**

**JSON (JavaScript Object Notation)** es un formato ligero de intercambio de datos que es fácil de leer para humanos y simple de procesar para máquinas. Un ejemplo de respuesta JSON del sistema podría ser:

```json
{
  "success": true,
  "message": "Asistencia registrada correctamente",
  "data": {
    "id": 12345,
    "fecha": "2025-11-24",
    "estado": "PRESENTE",
    "horaIngreso": "08:15:00"
  }
}
```

Este formato es universalmente compatible con prácticamente cualquier lenguaje de programación o plataforma, permitiendo que diferentes tipos de clientes (aplicaciones web, móviles, sistemas de terceros) puedan consumir la API del sistema.

### 3.4 La Capa Controlador: Orquestación del Flujo de Datos

Los **controladores** actúan como el "pegamento" que une las solicitudes entrantes con la lógica de negocio y formatea las respuestas. Son responsables de:

**Recepción y Validación Inicial:**

Cuando llega una solicitud al sistema, el controlador es el primer componente que la recibe. Extrae y valida los parámetros enviados por el cliente, asegurándose de que tienen el formato y tipo correcto antes de procesarlos.

Por ejemplo, si una solicitud incluye una fecha, el controlador verifica que efectivamente sea una fecha válida y no un texto aleatorio. Si incluye un identificador numérico, verifica que sea realmente un número.

**Transformación y Normalización:**

Los controladores implementan flexibilidad en los nombres de campos para mejorar la experiencia del desarrollador. El sistema acepta múltiples variantes para el mismo campo. Por ejemplo, para referirse al identificador de un estudiante, el sistema acepta cualquiera de estas variantes:
- studentId
- student_id  
- idStudent

El controlador normaliza estas variantes a un formato único antes de pasarlas a los servicios, permitiendo que diferentes clientes del sistema usen la convención de nombres que prefieran.

**Invocación de Servicios:**

Una vez validados y normalizados los datos, el controlador invoca los servicios apropiados de lógica de negocio, pasándoles la información procesada. El controlador no implementa lógica de negocio propia, simplemente coordina entre las solicitudes y los servicios.

**Formateo de Respuestas:**

Los servicios devuelven objetos estandarizados con información sobre el resultado de la operación. El controlador toma esta información y la convierte en una respuesta HTTP apropiada, incluyendo:
- Código de estado HTTP (200 para éxito, 400 para errores del cliente, 500 para errores del servidor, etc.)
- Encabezados de respuesta con metadata
- Cuerpo de la respuesta en formato JSON

**Manejo de Errores:**

Si ocurre algún error durante el procesamiento, el controlador lo captura y lo transforma en una respuesta de error comprensible para el cliente, incluyendo información sobre qué salió mal (sin exponer detalles internos que podrían comprometer la seguridad).

Cada respuesta de error incluye un identificador único de correlación (que se explicará en el capítulo de auditoría) que permite rastrear el error en los logs del sistema para diagnóstico y resolución de problemas.

---

## IV. Middlewares: La Cadena de Procesamiento

### 4.1. Concepto de Middleware

Los middlewares constituyen una de las características más potentes de Express.js y representan funciones que se ejecutan secuencialmente durante el procesamiento de una solicitud HTTP, antes de que esta alcance el controlador final. Se puede visualizar como una cadena de montaje en una fábrica: cada estación (middleware) realiza una tarea específica sobre el producto (solicitud) que pasa por ella. Cada middleware tiene la capacidad de modificar la solicitud, agregar información adicional, validar datos, registrar eventos o incluso detener el procesamiento si detecta algún problema.

La arquitectura de middlewares sigue un patrón de responsabilidad en cadena (Chain of Responsibility), donde cada middleware decide si pasa la solicitud al siguiente eslabón o la detiene. Esta modularidad permite organizar el código de forma limpia y reutilizable: un mismo middleware puede aplicarse a múltiples rutas sin duplicar código. Por ejemplo, un middleware de autenticación puede verificar la identidad del usuario en todas las rutas protegidas del sistema.

### 4.2. Middleware de Autenticación

El middleware de autenticación constituye la primera línea de defensa del sistema. Su función principal es verificar que el usuario que realiza una solicitud esté debidamente identificado y autorizado para acceder al recurso solicitado. En el contexto de esta arquitectura, la autenticación se basa en tokens JWT (JSON Web Tokens), un estándar de la industria para transmitir información de identidad de forma segura.

Cuando un usuario inicia sesión correctamente, el servidor genera un token JWT que contiene información codificada sobre la identidad del usuario y sus permisos. Este token se envía al cliente, quien debe incluirlo en todas las solicitudes posteriores mediante un encabezado HTTP específico. El middleware de autenticación intercepta cada solicitud entrante, extrae el token del encabezado, lo valida criptográficamente para asegurar que no ha sido alterado, verifica que no haya expirado, y finalmente extrae la información del usuario para adjuntarla a la solicitud. Si cualquiera de estas validaciones falla, el middleware detiene el procesamiento inmediatamente y devuelve un error de autenticación.

### 4.3. Control de Acceso Basado en Roles

Complementando el middleware de autenticación, existe un segundo nivel de protección basado en roles (Role-Based Access Control o RBAC). No es suficiente con saber quién es el usuario; también es necesario determinar qué acciones puede realizar. El sistema define varios roles con diferentes niveles de privilegio, por ejemplo: administrador, personal administrativo y preceptor escolar.

El middleware de autorización por roles verifica que el usuario autenticado posea al menos uno de los roles requeridos para acceder a un endpoint específico. Por ejemplo, las operaciones de lectura de datos de asistencia pueden estar disponibles para cualquier usuario autenticado, mientras que las operaciones de modificación o eliminación requieren privilegios administrativos. Esta separación granular de permisos implementa el principio de mínimo privilegio: cada usuario tiene exactamente los permisos necesarios para realizar su trabajo, ni más ni menos, reduciendo así la superficie de ataque del sistema.

### 4.4. Identificación de Correlación y Trazabilidad

Otro middleware crítico del sistema es el generador de identificadores de correlación. Cuando un sistema distribuido maneja múltiples solicitudes concurrentes, resulta extremadamente difícil rastrear qué mensajes en los logs corresponden a qué solicitud particular. Esto es especialmente problemático cuando se diagnostican errores o se analizan incidentes de seguridad.

El middleware de correlación asigna un identificador único (UUID - Universally Unique Identifier) a cada solicitud entrante apenas llega al sistema. Este identificador se propaga a través de todas las capas del sistema: controladores, servicios, consultas a la base de datos, y registros de auditoría. Si el cliente ya envía un identificador de correlación (por ejemplo, desde un frontend), el middleware lo respeta; de lo contrario, genera uno nuevo.

Este identificador aparece en todos los mensajes de log relacionados con esa solicitud particular y también se incluye en las respuestas de error. Cuando un usuario reporta un problema, puede proporcionar este identificador al equipo técnico, quien puede entonces filtrar los logs del sistema para ver exactamente qué ocurrió durante el procesamiento de esa solicitud específica, simplificando enormemente el diagnóstico y resolución de problemas.

### 4.5. Seguridad y Sanitización de Entrada

La seguridad es una preocupación transversal que permea todo el sistema. El middleware de seguridad implementa varias capas de protección:

**CORS (Cross-Origin Resource Sharing):** Este mecanismo controla qué dominios web pueden acceder a la API. Sin esta protección, cualquier sitio web malicioso podría intentar enviar solicitudes a la API desde el navegador de un usuario legítimo, explotando sus credenciales. El middleware CORS configura los encabezados HTTP apropiados para permitir solo los orígenes autorizados.

**Limitación de Tasa (Rate Limiting):** Para prevenir ataques de denegación de servicio y abusos del sistema, se implementa un límite en la cantidad de solicitudes que un mismo cliente puede realizar en un período de tiempo. Por ejemplo, los endpoints de inicio de sesión tienen límites más estrictos para prevenir ataques de fuerza bruta contra credenciales.

**Sanitización de Entrada:** Este middleware examina todos los datos recibidos en busca de contenido potencialmente malicioso, como intentos de inyección de código o caracteres especiales que podrían explotar vulnerabilidades. Se eliminan o escapan automáticamente caracteres peligrosos antes de que los datos lleguen a la lógica de negocio.

**Validación de Formato JSON:** El sistema fuerza a que todas las solicitudes que envían datos utilicen el formato JSON con el encabezado Content-Type apropiado. Esto previene ciertos tipos de ataques que explotan la confusión de formatos.

---

## V. Controladores y Servicios: Lógica de Negocio Estructurada

### 5.1. La Capa de Controladores

Los controladores representan el punto de entrada a la lógica de negocio del sistema. Actúan como adaptadores entre el protocolo HTTP (con sus particularidades de encabezados, códigos de estado, y formatos de mensaje) y la lógica de negocio pura que no debería preocuparse por detalles de comunicación.

Cada controlador en el sistema se especializa en un dominio específico del negocio escolar: gestión de estudiantes, registro de asistencias, administración de aulas, configuración de horarios, etc. Esta especialización permite que cada controlador se mantenga enfocado y manejable, evitando los "controladores gigantes" que intentan hacer demasiadas cosas y se vuelven imposibles de mantener.

**Responsabilidades de un Controlador:**

**Extracción y Validación de Parámetros:** Los datos pueden llegar en diferentes partes de la solicitud HTTP: en la URL, en parámetros de consulta, en el cuerpo del mensaje, o en encabezados. El controlador extrae estos datos y realiza validaciones básicas de formato (por ejemplo, verificar que un identificador sea un número válido, que una fecha tenga el formato correcto, que los campos obligatorios estén presentes).

**Normalización de Nomenclatura:** Diferentes clientes del sistema (aplicación web, aplicación móvil, integraciones externas) pueden usar diferentes convenciones de nombres para los mismos conceptos. Por ejemplo, el identificador de un estudiante podría enviarse como "student_id", "idStudent" o "studentId". Los controladores normalizan estas variantes a un formato interno consistente.

**Traducción de Errores:** Los servicios de negocio devuelven objetos de resultado estructurados que indican éxito o fracaso con información descriptiva. El controlador traduce estos resultados en respuestas HTTP apropiadas con códigos de estado correctos y mensajes en español comprensibles para el usuario final.

**Delegación a Servicios:** El controlador no implementa lógica de negocio; esa responsabilidad recae en los servicios. El controlador simplemente prepara los datos y los envía al servicio apropiado, luego toma el resultado y lo formatea para la respuesta HTTP.

### 5.2. La Capa de Servicios

Los servicios contienen la lógica de negocio central del sistema. Mientras que los controladores entienden HTTP y los modelos entienden la base de datos, los servicios entienden las reglas del dominio escolar: cómo calcular ausencias, cuándo un estudiante puede retirarse anticipadamente, cómo validar horarios de clase, etc.

**Independencia de Protocolo:**

Una característica fundamental de los servicios es su completa independencia del protocolo de comunicación. Un servicio no sabe si fue invocado desde una solicitud HTTP, desde una línea de comandos, desde un proceso batch programado, o desde una prueba unitaria. Esta independencia facilita enormemente las pruebas y permite reutilizar la misma lógica en diferentes contextos.

**Transaccionalidad y Consistencia:**

Los servicios son responsables de mantener la consistencia de los datos. Cuando una operación requiere múltiples cambios en la base de datos que deben aplicarse todos juntos o ninguno (por ejemplo, registrar una asistencia y actualizar el contador de ausencias), el servicio coordina una transacción de base de datos que garantiza esta atomicidad.

**Lógica de Negocio Compleja:**

Ejemplos de lógica de negocio implementada en los servicios incluyen:

- Cálculo de ausencias fraccionarias cuando un estudiante llega tarde o se retira temprano
- Actualización incremental de agregados anuales de ausencias
- Validación de que no existan registros duplicados de asistencia para el mismo estudiante y fecha
- Verificación de que las modificaciones respeten las ventanas de inmutabilidad (períodos en los que ciertos datos ya no pueden modificarse)
- Generación de reportes agregados de asistencia por aula, división o año académico

**Patrón de Respuesta Consistente:**

Todos los servicios siguen un patrón de respuesta consistente: devuelven objetos con una propiedad "success" que indica si la operación fue exitosa. En caso de éxito, incluyen los datos resultantes; en caso de error, incluyen un mensaje descriptivo y, opcionalmente, información adicional sobre el problema. Este patrón consistente simplifica el manejo de resultados en los controladores y facilita el debugging.

---

## VI. Base de Datos y Persistencia

### 6.1. Prisma ORM: Abstracción de la Base de Datos

Como se mencionó anteriormente, Prisma es el ORM (Object-Relational Mapping) que actúa como puente entre el código JavaScript/Node.js y la base de datos PostgreSQL relacional. Esta sección profundiza en cómo Prisma estructura y gestiona la persistencia de datos.

**Schema como Fuente de Verdad:**

El corazón de Prisma es el archivo de esquema, un archivo de texto que define la estructura completa de la base de datos en un formato declarativo y legible. Este esquema especifica todas las tablas (llamadas "modelos" en Prisma), sus columnas (llamadas "campos"), los tipos de datos, las relaciones entre tablas, los índices para optimizar consultas, y las restricciones de unicidad e integridad.

La ventaja de este enfoque declarativo es que el esquema sirve como documentación viviente y verificable de la estructura de datos. Cualquier desarrollador puede leer el esquema y comprender inmediatamente cómo están organizados los datos sin necesidad de consultar documentación externa o examinar la base de datos directamente.

**Sistema de Migraciones:**

Cuando se modifica el esquema (por ejemplo, para agregar una nueva tabla o campo), Prisma genera automáticamente scripts de migración SQL que transforman la base de datos existente a la nueva estructura. Estas migraciones son archivos versionados que se almacenan junto con el código fuente, permitiendo:

- Replicar exactamente la misma estructura de base de datos en diferentes entornos (desarrollo, pruebas, producción)
- Rastrear históricamente cómo ha evolucionado el esquema a lo largo del tiempo
- Revertir cambios si fuera necesario
- Sincronizar automáticamente la base de datos cuando diferentes desarrolladores trabajan en paralelo

**Cliente Generado Automáticamente:**

Basándose en el esquema, Prisma genera automáticamente un cliente JavaScript tipado que proporciona métodos para todas las operaciones de base de datos posibles. Este cliente es verificado en tiempo de desarrollo: si intentas consultar un campo que no existe o usar un tipo de dato incorrecto, recibes un error inmediatamente en el editor de código, mucho antes de ejecutar el programa.

### 6.2. Modelo de Datos del Sistema Escolar

El sistema gestiona una estructura de datos compleja que refleja la organización de una institución educativa. Los modelos principales incluyen:

**Jerarquía Académica:**

- Años Académicos: Representan períodos lectivos con fechas de inicio y fin, además de configuración de calendarios escolares
- Divisiones: Agrupaciones dentro de un año (por ejemplo, primer año, segundo año)  
- Aulas: Combinaciones únicas de año académico y división (por ejemplo, "1ºA del ciclo lectivo 2024")

**Estudiantes y Personal:**

- Estudiantes: Información personal, pertenencia a un aula, estado de matrícula
- Personal Administrativo: Usuarios con capacidad de gestionar el sistema
- Preceptores: Usuarios con permisos específicos sobre ciertas aulas

**Asistencia y Control:**

- Registros de Asistencia: Un registro por estudiante por día con estado (presente, ausente, tardanza, retiro anticipado)
- Eventos de Ausencia: Modificaciones incrementales a las ausencias (llegadas tarde, salidas tempranas, justificaciones, ajustes manuales)
- Agregados Anuales: Totalizaciones de ausencias por estudiante por año para consultas rápidas
- Retiros de Estudiantes: Registros de salidas anticipadas del establecimiento con autorización

**Horarios y Calendario:**

- Horarios: Bloques de tiempo definidos por día de semana, hora de inicio y fin
- Asignación de Horarios a Aulas: Relación entre aulas y sus horarios regulares
- Excepciones de Horario: Modificaciones temporales al horario regular para fechas específicas
- Días No Escolares: Fechas en las que no hay actividad escolar (feriados, recesos)

**Datos Biométricos:**

El sistema incluye modelos para gestionar dispositivos biométricos y sus registros, permitiendo automatizar parcialmente el registro de asistencias mediante lectores de huellas dactilares o tarjetas de proximidad.

### 6.3. Restricciones de Unicidad e Integridad

Una base de datos bien diseñada no solo almacena datos, sino que también los protege activamente contra inconsistencias. El sistema implementa múltiples restricciones que garantizan la integridad de la información:

**Unicidad de Registros:**

Ciertas combinaciones de campos deben ser únicas para evitar duplicados problemáticos. Por ejemplo:

- Un aula se identifica únicamente por la combinación de año académico y división (no puede haber dos "1ºA" en el mismo ciclo lectivo)
- Un estudiante se identifica únicamente por su aula y nombre de usuario
- Un registro de asistencia es único para la combinación de estudiante y fecha (no puede haber dos registros de asistencia para el mismo estudiante el mismo día)
- Un horario se identifica por día de la semana, hora de inicio y hora de fin
- Un evento de retiro de estudiante referencia exactamente un registro de asistencia

Estas restricciones se definen a nivel de base de datos mediante índices únicos, lo que significa que es imposible violarlas incluso si hubiera errores en el código de la aplicación. La base de datos rechaza automáticamente cualquier intento de insertar datos duplicados.

**Integridad Referencial:**

Las relaciones entre entidades se protegen mediante claves foráneas (foreign keys). Por ejemplo, cada estudiante debe pertenecer a un aula válida existente; no puede haber estudiantes "huérfanos" sin aula. Si se intenta eliminar un aula que tiene estudiantes asociados, la base de datos rechaza la operación, forzando primero la reasignación o eliminación de los estudiantes.

Esta protección en cascada evita estados inválidos donde los datos apuntan a registros inexistentes, manteniendo la coherencia referencial en todo momento.

### 6.4. Optimización mediante Índices

Las consultas a bases de datos pueden volverse extremadamente lentas cuando operan sobre grandes volúmenes de información. Para un sistema de asistencia escolar con potencialmente miles de estudiantes y cientos de miles de registros de asistencia acumulados a lo largo de años, la optimización es crítica.

Los índices son estructuras auxiliares que la base de datos mantiene para acelerar búsquedas específicas. Funcionan de manera similar a un índice en un libro: en lugar de leer secuencialmente todas las páginas para encontrar un tema, puedes consultar el índice que apunta directamente a las páginas relevantes.

El sistema implementa índices estratégicos sobre las columnas que se consultan frecuentemente:

- Índices por identificador de estudiante para consultas rápidas de todos los registros de un estudiante
- Índices por fecha para búsquedas rápidas de registros en un período temporal
- Índices compuestos (múltiples columnas) para consultas que filtran por aula y fecha simultáneamente
- Índices sobre campos de estado para facilitar agregaciones (por ejemplo, contar cuántos estudiantes estuvieron ausentes en un día)

La correcta indexación permite que consultas que de otro modo tomarían varios segundos se completen en milisegundos, manteniendo la responsividad del sistema incluso con años de datos históricos.

---

## VII. Seguridad y Autenticación con JWT

### 7.1. Fundamentos de JSON Web Tokens (JWT)

La seguridad en aplicaciones web modernas requiere mecanismos de autenticación que sean simultáneamente seguros, eficientes y escalables. Los JSON Web Tokens (JWT) representan un estándar ampliamente adoptado para transmitir información de identidad de manera segura entre partes.

Un JWT es esencialmente un contenedor de información estructurada que puede ser verificado criptográficamente para garantizar que no ha sido alterado. A diferencia de los sistemas tradicionales de sesiones (donde el servidor mantiene información de sesión en memoria o en una base de datos), JWT permite autenticación sin estado (stateless): toda la información necesaria para validar una solicitud viaja con la solicitud misma.

**Estructura de un JWT:**

Un token JWT está compuesto por tres secciones separadas por puntos:

**Header.Payload.Signature**

Cada sección está codificada en Base64URL (una variante de Base64 segura para URLs), lo que permite transmitir el token en encabezados HTTP, parámetros de URL o cookies.

### 7.2. Anatomía Detallada de un Token JWT

Para comprender completamente cómo funcionan los JWT en este sistema, analicemos cada componente:

**Header (Encabezado):**

El encabezado contiene metadata sobre el token mismo. Especifica dos piezas críticas de información:

- El tipo de token, que siempre es "JWT"
- El algoritmo criptográfico utilizado para la firma

Ejemplo de contenido del encabezado en formato legible (antes de codificación Base64):

```
{
  "typ": "JWT",
  "alg": "HS256"
}
```

Este encabezado indica que el token utiliza el algoritmo HMAC-SHA256 para su firma. El sistema soporta tanto HMAC-SHA256 (HS256) como RSA-SHA256 (RS256), dependiendo de la configuración de seguridad elegida.

**Payload (Carga Útil):**

El payload contiene las "claims" (afirmaciones) sobre la identidad del usuario y sus atributos. Estas claims se dividen en tres categorías:

*Claims Registradas:* Definidas por el estándar JWT, incluyen:
- `iss` (issuer): Identifica quién emitió el token (la aplicación de autenticación)
- `sub` (subject): Identifica al sujeto del token (el identificador único del usuario)
- `aud` (audience): Para quién está destinado el token (la aplicación principal)
- `exp` (expiration): Timestamp Unix cuando el token expira
- `iat` (issued at): Timestamp Unix cuando se emitió el token
- `jti` (JWT ID): Identificador único del token

*Claims Privadas:* Específicas del sistema, incluyen:
- `user_id`: Identificador numérico del usuario en la base de datos
- `username`: Nombre de usuario para identificación humana
- `role`: Rol del usuario (ADMIN, STAFF, PRECEPTOR)
- `email`: Correo electrónico del usuario (si está disponible)

Ejemplo de payload decodificado:

```
{
  "iss": "sistema-asistencia-auth",
  "sub": "user:245",
  "aud": "sistema-asistencia-core",
  "exp": 1735689600,
  "iat": 1735686000,
  "user_id": 245,
  "username": "jperez",
  "role": "STAFF",
  "email": "jperez@escuela.edu"
}
```

Este payload comunica que el usuario con ID 245, nombre "jperez" y rol STAFF fue autenticado el 1 de enero de 2024 a las 10:00 AM y el token expira a las 11:00 AM (una hora después).

**Signature (Firma):**

La firma es la pieza criptográfica que garantiza la integridad del token. Se calcula tomando el encabezado codificado, el payload codificado, y aplicando el algoritmo criptográfico especificado junto con una clave secreta.

Para HS256 (HMAC con SHA-256), el proceso es:
```
Firma = HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  clave_secreta
)
```

La clave secreta es conocida solo por el servidor. Cuando llega un token, el servidor recalcula la firma usando la misma clave y la compara con la firma del token. Si coinciden, el token es auténtico; si no, ha sido alterado o fue generado con una clave diferente.

Para RS256 (RSA con SHA-256), se utiliza criptografía asimétrica:
- El servidor de autenticación firma con una clave privada
- Cualquier servidor puede verificar con la clave pública correspondiente

Esto permite que múltiples servicios validen tokens sin compartir la clave privada de firma.

### 7.3. Algoritmos Criptográficos: HS256 vs RS256

El sistema soporta dos algoritmos criptográficos principales, cada uno con diferentes características de seguridad:

**HS256 (HMAC-SHA256):**

HMAC (Hash-based Message Authentication Code) combinado con SHA-256 utiliza criptografía simétrica: la misma clave se usa tanto para firmar como para verificar tokens.

Ventajas:
- Más rápido computacionalmente que RSA
- Más simple de configurar: solo requiere una clave secreta
- Suficiente para sistemas donde el emisor y verificador son la misma aplicación o aplicaciones confiables

Consideraciones:
- La clave secreta debe protegerse estrictamente
- Todos los servidores que validen tokens deben tener acceso a la clave
- Si la clave se compromete, debe rotarse y todos los tokens activos se invalidan

**RS256 (RSA-SHA256):**

RSA utiliza criptografía asimétrica: un par de claves (privada y pública).

Ventajas:
- La clave privada solo necesita residir en el servidor de autenticación
- La clave pública puede distribuirse libremente a cualquier servicio que necesite validar tokens
- Más seguro en arquitecturas distribuidas donde múltiples servicios validan tokens
- Si un servicio de validación se compromete, la clave de firma permanece segura

Consideraciones:
- Requiere gestión de pares de claves RSA (típicamente 2048 bits o más)
- Más costoso computacionalmente que HMAC

El sistema permite configurar cuál algoritmo utilizar mediante variables de entorno, adaptándose a diferentes requisitos de seguridad.

### 7.4. Ciclo de Vida de un Token JWT

**Emisión:**

1. El usuario envía credenciales (usuario y contraseña) al servidor de autenticación
2. El servidor valida las credenciales contra la base de datos
3. Si son válidas, el servidor consulta los roles y permisos del usuario
4. Se construye el payload del JWT con la información del usuario
5. Se firma el payload usando el algoritmo configurado
6. El token completo se envía al cliente

**Uso:**

1. El cliente almacena el token (típicamente en memoria o localStorage del navegador)
2. Para cada solicitud a endpoints protegidos, el cliente incluye el token en el encabezado HTTP Authorization:
   ```
   Authorization: Bearer <token_completo>
   ```
3. El middleware de autenticación extrae el token del encabezado
4. Verifica la firma criptográfica
5. Decodifica el payload y extrae la información del usuario
6. Valida que el token no haya expirado (verificando el claim `exp`)
7. Si todo es válido, adjunta la información del usuario a la solicitud para que esté disponible en controladores y servicios

**Expiración y Renovación:**

Los tokens tienen una vida útil limitada (típicamente entre 15 minutos y 1 hora) por seguridad. Si un token es robado, solo puede usarse hasta que expire.

Para sesiones de larga duración sin requerir que el usuario inicie sesión constantemente, el sistema puede implementar refresh tokens:
- Tokens de acceso de corta duración para operaciones normales
- Tokens de actualización de larga duración (días o semanas) almacenados de forma más segura
- Cuando el token de acceso expira, el cliente usa el refresh token para obtener un nuevo token de acceso sin reiniciar sesión

**Revocación:**

Un desafío de JWT es que, al ser sin estado, no pueden "revocarse" directamente. Si un token válido es comprometido, seguirá siendo válido hasta que expire. El sistema implementa varios mecanismos para mitigar esto:

- Tiempos de expiración cortos para tokens de acceso
- Lista de tokens revocados (almacenada en base de datos o cache) contra la que se verifican los tokens
- Cambio de clave de firma invalida instantáneamente todos los tokens activos (opción nuclear para emergencias)

---

## VIII. Auditoría y Trazabilidad

### 8.1. Registro Automático de Operaciones

En un sistema que maneja información sensible como registros de asistencia escolar, es fundamental mantener un registro completo y permanente de todas las modificaciones realizadas a los datos. El sistema de auditoría automática captura información sobre quién modificó qué, cuándo y cómo.

**Middleware de Auditoría:**

El sistema implementa un middleware de Prisma que intercepta automáticamente todas las operaciones de escritura en la base de datos (creación, actualización, eliminación). Este middleware registra en una tabla de auditoría independiente:

- Timestamp exacto de la operación
- Usuario que realizó la operación (extraído del token JWT)
- Tipo de operación (CREATE, UPDATE, DELETE)
- Entidad afectada (tabla de base de datos)
- Identificador del registro afectado
- Estado anterior de los datos (para operaciones UPDATE y DELETE)
- Estado posterior de los datos (para operaciones CREATE y UPDATE)
- Metadata adicional contextual

Este registro automático elimina la posibilidad de olvidar auditar una operación crítica, ya que no requiere que los desarrolladores recuerden manualmente llamar funciones de auditoría.

**Casos Especiales de Auditoría Manual:**

Para operaciones particularmente sensibles, además de la auditoría automática, se implementa auditoría manual explícita con metadata enriquecida. Ejemplos incluyen:

- Registros de asistencia: Se audita con información adicional sobre el dispositivo desde el que se registró (biométrico, manual desde web, etc.)
- Eventos de ausencia: Se audita el cambio en las fracciones de ausencia y su impacto en agregados anuales
- Modificaciones a configuración de seguridad o roles de usuario

### 8.2. Inmutabilidad de Datos Históricos

Ciertos datos, una vez registrados y pasado un período de tiempo, no deberían poder modificarse para mantener la integridad histórica. El sistema implementa ventanas de inmutabilidad:

**Períodos de Gracia:**

Durante un período configurable (por ejemplo, 48 horas), los registros pueden modificarse libremente para corregir errores. Pasado este período, los datos entran en estado inmutable.

**Mecanismo de Protección:**

Antes de procesar cualquier operación de modificación o eliminación, los servicios consultan la configuración de inmutabilidad almacenada en base de datos. Esta configuración define:

- Número de días de gracia para cada tipo de entidad
- Excepciones por rol (por ejemplo, administradores pueden tener períodos más largos)
- Fechas específicas bloqueadas (por ejemplo, bloquear modificaciones a ciclos lectivos ya cerrados)

Si una operación viola la política de inmutabilidad, se rechaza con un mensaje explicativo claro.

**Auditoría de Intentos Bloqueados:**

Incluso los intentos rechazados de modificar datos inmutables se registran en la auditoría, creando un rastro de posibles intentos de manipulación indebida de registros históricos.

### 8.3. Validación de Integridad de Datos

Más allá de las restricciones de base de datos, el sistema implementa validaciones de lógica de negocio complejas:

**Validación de Asistencia:**

- No puede haber más de un registro de asistencia para el mismo estudiante en la misma fecha
- Las fechas de asistencia deben estar dentro del rango del año académico activo
- No puede registrarse asistencia en días marcados como no escolares
- Los eventos de ausencia deben referenciar un registro de asistencia existente

**Validación de Horarios:**

- Los bloques horarios no pueden solaparse para la misma aula
- Las horas de inicio deben ser anteriores a las horas de fin
- Las excepciones de horario deben referenciar fechas futuras o del presente

**Validación de Estructura Académica:**

- No pueden existir aulas duplicadas (misma combinación año/división) en un ciclo lectivo
- Los estudiantes no pueden estar matriculados en múltiples aulas simultáneamente
- Las divisiones deben pertenecer a años académicos válidos

Estas validaciones se ejecutan en la capa de servicios antes de interactuar con la base de datos, proporcionando mensajes de error descriptivos cuando se violan las reglas de negocio.

---

## IX. Funcionalidades Especializadas del Sistema

### 9.1. Gestión de Ausencias Fraccionarias

Una característica distintiva del sistema es su capacidad para manejar ausencias fraccionarias, reconociendo que no todas las ausencias son iguales. Un estudiante que falta todo el día tiene un impacto diferente en su récord que uno que llega tarde o se retira temprano.

**Concepto de Fracción de Ausencia:**

El sistema registra cada asistencia con una fracción que representa qué proporción del día el estudiante estuvo ausente:
- 0.0 = Presente todo el día
- 0.5 = Ausente media jornada
- 1.0 = Ausente todo el día

**Eventos Modificadores:**

Los eventos de ausencia permiten ajustar incrementalmente estas fracciones:

- Llegada Tarde: Suma una fracción (típicamente 0.25 o 0.5 dependiendo de cuánto tarde llegó)
- Retiro Anticipado: Suma una fracción proporcional al tiempo no asistido
- Justificación Médica: Resta fracciones previamente contabilizadas
- Ajuste Manual Administrativo: Permite correcciones por casos excepcionales

Cada evento registra su delta (cambio) en las fracciones, permitiendo rastrear completamente cómo se llegó al total de ausencias de un estudiante.

**Agregación Anual:**

Para facilitar consultas rápidas, el sistema mantiene una tabla de agregados anuales que totaliza:
- Ausencias completas (días enteros perdidos)
- Ausencias fraccionarias (suma de todas las fracciones)

Estos agregados se actualizan incrementalmente con cada nuevo evento de ausencia, evitando tener que recalcular desde cero sumando miles de registros históricos.

### 9.2. Integración Biométrica

El sistema soporta integración con dispositivos biométricos para automatizar parcialmente el registro de asistencias:

**Dispositivos Soportados:**

- Lectores de huella dactilar
- Lectores de tarjeta de proximidad/RFID
- Sistemas de reconocimiento facial

**Flujo de Integración:**

1. Los dispositivos biométricos registran eventos de entrada/salida con timestamps exactos
2. Estos eventos se almacenan en una tabla intermedia (eventos biométricos sin procesar)
3. Un proceso automatizado revisa periódicamente estos eventos y los correlaciona con:
   - La identidad del estudiante (mediante el identificador biométrico)
   - El horario esperado de clase
   - El registro de asistencia del día
4. Basándose en esta correlación, el sistema puede:
   - Marcar automáticamente como presente si el estudiante ingresó dentro del horario
   - Generar un evento de llegada tarde si ingresó después del horario de inicio
   - Generar un evento de retiro anticipado si egresó antes del fin de clases
5. Los casos ambiguos se marcan para revisión manual por un preceptor

Esta semi-automatización reduce significativamente la carga administrativa mientras mantiene supervisión humana sobre casos excepcionales.

### 9.3. Generación de Reportes

El sistema proporciona endpoints especializados para generar reportes agregados de asistencia:

**Reportes por Estudiante:**
- Historial completo de asistencia con desglose de ausencias justificadas e injustificadas
- Tendencias de puntualidad a lo largo del año
- Comparación contra el promedio del aula

**Reportes por Aula:**
- Porcentaje promedio de asistencia por día/semana/mes
- Identificación de estudiantes en riesgo (cercanos a umbrales críticos de ausencias)
- Comparación entre diferentes aulas del mismo año

**Reportes Institucionales:**
- Tasas de asistencia globales por división
- Identificación de tendencias estacionales
- Datos para cumplimiento normativo con autoridades educativas

Estos reportes se generan mediante consultas optimizadas que aprovechan los agregados anuales y los índices de base de datos para responder rápidamente incluso sobre grandes volúmenes de datos históricos.

---

## X. Consideraciones de Despliegue y Operación

### 10.1. Arquitectura de Despliegue

El sistema está diseñado para desplegarse en entornos modernos de contenedores:

**Separación de Aplicaciones:**

Las dos aplicaciones (Core y Auth) se despliegan como procesos independientes, potencialmente en contenedores Docker separados. Esto permite:
- Escalar cada aplicación independientemente según la demanda
- Actualizar una sin afectar la otra
- Aislar fallos (un problema en Core no derriba Auth)

**Base de Datos:**

PostgreSQL se ejecuta como un servicio separado, preferiblemente en infraestructura gestionada (por ejemplo, AWS RDS, Azure Database for PostgreSQL) que proporciona:
- Respaldos automáticos
- Replicación para alta disponibilidad
- Mantenimiento y actualizaciones gestionadas

**Variables de Entorno:**

Toda la configuración sensible (claves de cifrado, credenciales de base de datos, configuración CORS) se gestiona mediante variables de entorno, nunca embebida en el código. Esto permite:
- Diferentes configuraciones para desarrollo, staging y producción
- Rotación de secretos sin modificar código
- Cumplimiento de mejores prácticas de seguridad

### 10.2. Monitoreo y Logs

**Registro Estructurado:**

El sistema genera logs en formato estructurado (JSON) que incluyen:
- Timestamp con zona horaria
- Nivel de log (INFO, WARN, ERROR)
- Identificador de correlación
- Mensaje descriptivo
- Metadata contextual (usuario, endpoint, parámetros)

Esta estructura facilita el análisis automático mediante herramientas de agregación de logs.

**Métricas de Salud:**

Ambas aplicaciones exponen endpoints de salud que permiten a sistemas de monitoreo verificar:
- Disponibilidad de la aplicación
- Conectividad con la base de datos
- Latencia de consultas a base de datos
- Uso de memoria y CPU

**Alertas Proactivas:**

Se pueden configurar alertas basadas en patrones en los logs:
- Incremento súbito en tasas de error
- Latencia de base de datos por encima de umbrales
- Intentos repetidos de autenticación fallida (posible ataque)

### 10.3. Respaldos y Recuperación ante Desastres

**Respaldos de Base de Datos:**

- Respaldos completos diarios
- Respaldos incrementales cada hora
- Retención de al menos 30 días de respaldos
- Almacenamiento en ubicación geográficamente separada

**Procedimientos de Recuperación:**

Documentación detallada de cómo:
- Restaurar la base de datos desde un respaldo
- Sincronizar datos después de una restauración
- Validar la integridad de datos restaurados

**Pruebas de Recuperación:**

Simulaciones periódicas de escenarios de desastre para verificar que los procedimientos de recuperación funcionan correctamente y que los tiempos de recuperación son aceptables.

---

## Conclusión

La arquitectura backend del sistema de asistencia escolar representa una implementación moderna de principios y patrones de diseño bien establecidos, adaptados específicamente a las necesidades del dominio educativo. La decisión de utilizar una arquitectura dual de aplicaciones proporciona una separación clara de responsabilidades que mejora tanto la seguridad como la mantenibilidad del sistema.

La adopción del patrón Modelo-Vista-Controlador, junto con una clara separación entre controladores (que manejan HTTP) y servicios (que contienen lógica de negocio), resulta en un código organizado, testeable y extensible. El uso de Prisma ORM como capa de abstracción de base de datos no solo simplifica el acceso a datos sino que también proporciona seguridad de tipos y un sistema robusto de migraciones.

La implementación de seguridad multicapa - desde middlewares de autenticación y autorización basados en JWT, pasando por sanitización de entrada y rate limiting, hasta auditoría automática de todas las operaciones - garantiza que el sistema proteja adecuadamente la información sensible de estudiantes y personal.

Características especializadas como el manejo de ausencias fraccionarias, la integración con dispositivos biométricos, y las ventanas de inmutabilidad de datos históricos demuestran cómo la arquitectura ha sido adaptada a los requerimientos específicos del contexto escolar argentino.

En última instancia, esta arquitectura proporciona una base sólida y escalable sobre la cual construir un sistema de gestión de asistencia que puede evolucionar con las necesidades cambiantes de la institución educativa, manteniendo en todo momento la integridad, seguridad y trazabilidad de la información que gestiona.