import { Box, Divider, Typography } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { Students } from '../data/Data.ts';

// {
//     "id": 1,
//     "firstName": "Carlos",
//     "lastName": "Rodríguez",
//     "age": 13,
//     "email": "carlos.rodríguez1@ejemplo.com",
//     "classroom": "C5",
//     "unassistences": [
//       {
//         "day": "13-09-25",
//         "isJustified": true
//       },
//       {
//         "day": "16-09-25",
//         "isJustified": true
//       },
//       {
//         "day": "15-09-25",
//         "isJustified": false
//       },
//       {
//         "day": "26-09-25",
//         "isJustified": false
//       },
//       {
//         "day": "04-09-25",
//         "isJustified": true
//       },
//       {
//         "day": "19-09-25",
//         "isJustified": false
//       },
//       {
//         "day": "10-09-25",
//         "isJustified": false
//       },
//       {
//         "day": "21-09-25",
//         "isJustified": true
//       }
//     ]
//   },

export const UserData = () => {
  const student = Students[0]; // Obtener el primer estudiante como ejemplo

  return (
    <Box className='col-span-8 row-span-9 p-4 rounded shadow'>
      <Typography variant='h6'>Información del Usuario</Typography>
      <Divider />
      <Typography variant='body1' className='mt-2'>
        Nombre: {student.lastName} {student.firstName}{' '}
        <ArrowRightAltIcon fontSize='small' /> Estudiante
      </Typography>

      <Typography variant='body1'>Email: {student.email}</Typography>
      <Typography variant='body1'>Edad: {student.age}</Typography>
      <Typography variant='body1'>Curso: {student.classroom}</Typography>
      <Typography variant='body1'>
        Inasistencias: {student.unassistences.length}
      </Typography>
    </Box>
  );
};
