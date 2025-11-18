import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

type Unassistence = {
  day: string;
  isJustified: boolean;
};

type Student = {
  id: number;
  dni: number;
  first_name: string;
  last_name: string;
  age: number;
  email: string;
  classroom: string;
  unassistences: Unassistence[];
  role: string;
};

const DNI_MIN = 40_000_000;
const DNI_MAX = 50_000_000;
const TARGET_YEAR = 2025;
const SCHOOL_MONTHS = Array.from({ length: 10 }, (_, index) => index + 2); // Feb (2) to Nov (11)
const usedDnis = new Set<number>();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateUniqueDni = (used: Set<number>): number => {
  let dni = randomInt(DNI_MIN, DNI_MAX);
  while (used.has(dni)) {
    dni = randomInt(DNI_MIN, DNI_MAX);
  }
  used.add(dni);
  return dni;
};

const daysInMonth = (month: number): number =>
  new Date(TARGET_YEAR, month, 0).getDate();

const formatDate = (day: number, month: number): string =>
  `${day.toString().padStart(2, '0')}-${month
    .toString()
    .padStart(2, '0')}-${String(TARGET_YEAR).slice(-2)}`;

export function generateRandomStudent(id: number): Student {
  const firstNames = [
    'Juan',
    'María',
    'Pedro',
    'Lucía',
    'Sofía',
    'Carlos',
    'Ana',
    'Jorge',
    'Valentina',
    'Martín',
    'Florencia',
    'Tomás',
    'Camila',
    'Mateo',
    'Agustina',
  ];
  const lastNames = [
    'Pérez',
    'García',
    'Rodríguez',
    'López',
    'Fernández',
    'Martínez',
    'Sánchez',
    'Romero',
    'Díaz',
    'Ruiz',
    'Morales',
    'Torres',
    'Castro',
    'Vega',
    'Molina',
  ];

  const randomItem = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const first_name = randomItem(firstNames);
  const last_name = randomItem(lastNames);
  const age = randomInt(12, 21);
  const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${id}@ejemplo.com`;

  const divisions = ['A', 'B', 'C', 'D', 'E', 'F'];
  const years = ['1', '2', '3', '4', '5', '6', '7'];
  const classroom = `${randomItem(years)}${randomItem(divisions)}`;

  const dni = generateUniqueDni(usedDnis);

  // Generar faltas (0 a 30, distribuidas entre febrero y noviembre 2025)
  const totalUnassistences = randomInt(0, 30);
  const unassistences: Unassistence[] = [];
  const datesUsed = new Set<string>();

  while (unassistences.length < totalUnassistences) {
    const month = randomItem(SCHOOL_MONTHS);
    const day = randomInt(1, daysInMonth(month));
    const formattedDate = formatDate(day, month);

    if (datesUsed.has(formattedDate)) continue;
    datesUsed.add(formattedDate);

    unassistences.push({
      day: formattedDate,
      isJustified: Math.random() < 0.5,
    });
  }

  return {
    id,
    dni,
    first_name,
    last_name,
    age,
    email,
    role: 'STUDENT',
    classroom,
    unassistences,
  };
}

export function generateStudents(count: number): Student[] {
  const students: Student[] = [];
  for (let i = 1; i <= count; i++) {
    students.push(generateRandomStudent(i));
  }
  const outputPath = join(__dirname, 'Students.json');
  writeFileSync(outputPath, JSON.stringify(students, null, 2), 'utf-8');
  console.log(`Archivo Students.json generado en ${outputPath}`);
  return students;
}

generateStudents(1500);
