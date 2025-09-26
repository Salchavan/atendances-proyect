type Unassistence = {
  day: string;
  isJustified: boolean;
};

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  classroom: string;
  unassistences: Unassistence[];
};

export function generateRandomStudent(id: number): Student {
  const firstNames = ["Juan", "María", "Pedro", "Lucía", "Sofía", "Carlos", "Ana", "Jorge", "Valentina", "Martín", "Florencia", "Tomás", "Camila", "Mateo", "Agustina"];
  const lastNames = ["Pérez", "García", "Rodríguez", "López", "Fernández", "Martínez", "Sánchez", "Romero", "Díaz", "Ruiz", "Morales", "Torres", "Castro", "Vega", "Molina"];

  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const age = Math.floor(Math.random() * (21 - 12 + 1)) + 12;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@ejemplo.com`;

  const classroom = `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 7) + 1}`;

  // Generar faltas (máx 30, todas en septiembre 2025)
  const totalUnassistences = Math.floor(Math.random() * 31);
  const unassistences: Unassistence[] = [];
  const daysUsed = new Set<number>();

  while (unassistences.length < totalUnassistences) {
    const day = Math.floor(Math.random() * 30) + 1;
    if (!daysUsed.has(day)) {
      daysUsed.add(day);
      unassistences.push({
        day: `${day.toString().padStart(2, "0")}-09-25`,
        isJustified: Math.random() < 0.5
      });
    }
  }

  return {
    id,
    firstName,
    lastName,
    age,
    email,
    classroom,
    unassistences
  };
}

function generateStudents(count: number): Student[] {
  const students: Student[] = [];
  for (let i = 1; i <= count; i++) {
    students.push(generateRandomStudent(i));
  }
  return students;
}

// Generar los 500 alumnos
const students = generateStudents(500);

// Mostrar en formato JSON
console.log(JSON.stringify(students, null, 2));
