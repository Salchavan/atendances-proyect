import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Course = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: 'Mañana' | 'Tarde';
  specility?: string;
  // Simulated student IDs assigned to this course. Consecutive numbers, capped at 1500.
  studentIds: number[];
};

const chars = ['A', 'B', 'C', 'D', 'E', 'F'];
const years = [1, 2, 3, 4, 5, 6, 7];
// Turno fijo por letra: A/B/C = Mañana, D/E/F = Tarde
const getTurnForChar = (char: string): 'Mañana' | 'Tarde' =>
  ['A', 'B', 'C'].includes(char) ? 'Mañana' : 'Tarde';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCourses(): Course[] {
  const courses: Course[] = [];
  let id = 1;

  // global counter to assign consecutive student IDs across courses
  // IDs will be in range 1..1500 (wrapped using modulo)
  let nextStudentId = 1;

  for (const year of years) {
    for (const char of chars) {
      const course: Course = {
        id: id++,
        char,
        year,
        numberStudents: getRandomInt(15, 35),
        turn: getTurnForChar(char),
        studentIds: [],
      };

      // No se agrega especialidad: solo combinaciones year/char con turno derivado
      // assign consecutive student ids for this course, wrapping at 1500
      const ids: number[] = Array.from(
        { length: course.numberStudents },
        (_, i) => {
          const val = ((nextStudentId + i - 1) % 1500) + 1;
          return val;
        }
      );
      course.studentIds = ids;
      nextStudentId += course.numberStudents;

      courses.push(course);
    }
  }

  return courses;
}
export const genClassrooms = (outFile?: string) => {
  const allCourses = generateCourses();
  const outPath = outFile
    ? path.resolve(outFile)
    : path.resolve(__dirname, '..', 'Classrooms.json');
  fs.writeFileSync(outPath, JSON.stringify(allCourses, null, 2), 'utf8');
  console.log(`Generated ${outPath}`);
  return outPath;
};

// If this file is executed directly (ts-node, node, npx...), run the generator.
// Support calling with: npx ts-node src/data/gen/genClassrooms.ts [outPath]
try {
  const invokedArg = process.argv.find((a) => /genClassrooms\.ts$/.test(a));
  if (invokedArg) {
    const out = process.argv[2];
    console.log(
      'genClassrooms: invoked as script, output:',
      out ?? '(default)'
    );
    const outPath = genClassrooms(out);
    console.log('genClassrooms: wrote file ->', outPath);
  }
} catch (err) {
  console.error('genClassrooms: runner error', err);
}
