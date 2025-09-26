type Course = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: 'Mañana' | 'Tarde';
  specility?: string;
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

  for (const year of years) {
    for (const char of chars) {
      const course: Course = {
        id: id++,
        char,
        year,
        numberStudents: getRandomInt(15, 35),
        turn: getTurnForChar(char),
      };

      // No se agrega especialidad: solo combinaciones year/char con turno derivado
      courses.push(course);
    }
  }

  return courses;
}
export const genClassrooms = () => {
  const allCourses = generateCourses();
  return console.log(JSON.stringify(allCourses, null, 2));
};
