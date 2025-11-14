import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Compatibilidad ESM: __dirname equivalente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Este script lee `src/data/Students.json` y genera `src/data/Statics.json`.
// Interpretación de campos:
// - classroom: formato esperado como '7F' o '7 F' (curso + división)
// - curso (que aquí se llamará "curso_full"): el classroom completo, e.g. '7F'
// - año: la parte numérica del classroom, e.g. '7'
// - division: la letra, e.g. 'F'

function parseClassroom(classroom: unknown) {
  const s = String(classroom ?? '');
  const m = s.match(/^(\d+)\s*([A-Za-z])?/); // captura curso (digitos) y division (letra)
  return {
    curso: m ? m[1] : 'unknown',
    division: m && m[2] ? m[2].toUpperCase() : 'unknown',
  };
}

function computeStatics(students: any[]) {
  let totalStudents = 0;
  let totalFaltas = 0;
  let totalJustificadas = 0;

  const classroomCounts: Record<string, number> = {};
  const divisionCounts: Record<string, number> = {};
  const anoCounts: Record<string, number> = {};

  let estudianteMax: { student: any | null; faltas: number } = {
    student: null,
    faltas: 0,
  };

  for (const s of students) {
    if (!s || (s.id == null && s.dni == null && !s.email)) continue;
    totalStudents++;

    const un = Array.isArray(s.unassistences) ? s.unassistences : [];
    const faltasAlumno = un.length;
    totalFaltas += faltasAlumno;
    totalJustificadas += un.filter((u: any) => u && u.isJustified).length;

    // classroom (curso_full), division y año
    const { curso, division } = parseClassroom(s.classroom);
    const cursoFull =
      curso !== 'unknown' && division !== 'unknown'
        ? `${curso}${division}`
        : String(s.classroom ?? 'unknown');
    const cursoKey = String(cursoFull).toUpperCase();
    classroomCounts[cursoKey] = (classroomCounts[cursoKey] || 0) + faltasAlumno;
    divisionCounts[division] = (divisionCounts[division] || 0) + faltasAlumno;
    const anoKey = String(curso ?? 'unknown');
    anoCounts[anoKey] = (anoCounts[anoKey] || 0) + faltasAlumno;

    if (faltasAlumno > estudianteMax.faltas) {
      estudianteMax = { student: s, faltas: faltasAlumno };
    }
  }

  const totalInjustificadas = totalFaltas - totalJustificadas;

  function topKey(map: Record<string, number>) {
    let bestKey: string | null = null;
    let bestVal = -Infinity;
    for (const k of Object.keys(map)) {
      const v = map[k];
      if (v > bestVal) {
        bestVal = v;
        bestKey = k;
      }
    }
    return { key: bestKey, value: bestVal === -Infinity ? 0 : bestVal };
  }

  const topCurso = topKey(classroomCounts);
  const topDivision = topKey(divisionCounts);
  const topAno = topKey(anoCounts);

  return {
    numero_de_estudiantes: totalStudents,
    numero_total_de_faltas: totalFaltas,
    numero_de_faltas_justificadas: totalJustificadas,
    numero_de_faltas_injustificadas: totalInjustificadas,
    estudiante_con_mayor_cantidad_de_faltas: estudianteMax.student
      ? {
          id: estudianteMax.student.id ?? null,
          dni: estudianteMax.student.dni ?? null,
          first_name:
            estudianteMax.student.first_name ??
            estudianteMax.student.firstName ??
            null,
          last_name:
            estudianteMax.student.last_name ??
            estudianteMax.student.lastName ??
            null,
          email: estudianteMax.student.email ?? null,
          classroom: estudianteMax.student.classroom ?? null,
          total_faltas: estudianteMax.faltas,
        }
      : null,
    curso_con_mayor_cantidad_de_faltas: topCurso.key ?? null,
    curso_con_mayor_cantidad_de_faltas_count: topCurso.value ?? 0,
    division_con_mayor_cantidad_de_faltas: topDivision.key ?? null,
    division_con_mayor_cantidad_de_faltas_count: topDivision.value ?? 0,
    ano_con_mayor_cantidad_de_faltas: topAno.key ?? null,
    ano_con_mayor_cantidad_de_faltas_count: topAno.value ?? 0,
  };
}

function main() {
  const studentsPath = path.resolve(__dirname, '..', 'Students.json');
  const outPath = path.resolve(__dirname, '..', 'Statics.json');

  if (!fs.existsSync(studentsPath)) {
    console.error(
      `No se encontró ${studentsPath}. Ejecuta este script desde el repo y asegúrate que el archivo existe.`
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(studentsPath, { encoding: 'utf8' });
  let students: any[] = [];
  try {
    students = JSON.parse(raw);
    if (!Array.isArray(students))
      throw new Error('Students.json no es un array');
  } catch (err) {
    console.error('Error parseando Students.json:', (err as Error).message);
    process.exit(1);
  }

  const stats = computeStatics(students);
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2), {
    encoding: 'utf8',
  });
  console.log(`Generado ${outPath}`);
  console.log('Resumen:', {
    numero_de_estudiantes: stats.numero_de_estudiantes,
    numero_total_de_faltas: stats.numero_total_de_faltas,
  });
}

// Detección de ejecución directa compatible con ESM
if (process.argv[1] === __filename) {
  main();
}
