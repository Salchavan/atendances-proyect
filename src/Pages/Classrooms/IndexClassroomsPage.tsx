import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import Classroom from '../../data/Classrooms.json';
import { useNavigateTo } from '../../Logic.ts';

type ClassroomItem = {
  id: number;
  char: string;
  year: number;
  numberStudents: number;
  turn: string;
  specility?: string;
};

export const IndexClassroomsPage = () => {
  const navigateTo = useNavigateTo();

  const handleOpen = (item: ClassroomItem) => {
    // Navegar a la ruta dinámica '/home/classrooms/:id'
    navigateTo(`${item.id}`);
  };

  return (
    <Box className='col-span-8 row-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2'>
      {(Classroom as ClassroomItem[]).map((item) => {
        const title = `${item.year}º "${item.char}"`;
        return (
          <Card key={item.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardActionArea onClick={() => handleOpen(item)}>
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  spacing={1}
                >
                  <Typography
                    variant='h6'
                    fontWeight={700}
                    color='text.primary'
                  >
                    {title}
                  </Typography>
                  <Chip
                    size='small'
                    label={item.turn}
                    color='primary'
                    variant='outlined'
                  />
                </Stack>
                <Stack direction='row' spacing={1} mt={1} alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Estudiantes: {item.numberStudents}
                  </Typography>
                  {item.specility && (
                    <Chip
                      size='small'
                      label={item.specility}
                      variant='filled'
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
};
