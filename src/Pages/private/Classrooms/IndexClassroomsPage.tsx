import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigateTo } from '../../../Logic.ts';
import { useClassrooms } from '../../../hooks/useClassrooms';
import type { ClassroomItem } from '../../../hooks/useClassrooms';

export const IndexClassroomsPage = () => {
  const navigateTo = useNavigateTo();
  const { data: classrooms = [] } = useClassrooms();

  const YEARS = [1, 2, 3, 4, 5, 6, 7] as const;
  const byYear: ClassroomItem[][] = YEARS.map((y) =>
    classrooms.filter((c) => c.year === y)
  );

  const handleOpen = (item: ClassroomItem) => {
    navigateTo(`${item.id}`);
  };

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        minHeight: 0,
        gridColumn: '1 / -1',
        gridRow: '1 / -1',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 2,
        overflow: 'auto',
        alignContent: 'start',
      }}
    >
      {byYear.map((items, idx) => (
        <Box
          key={YEARS[idx]}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}
        >
          {items.map((item) => {
            const title = `${item.year}º "${item.char}"`;
            return (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardActionArea
                  onClick={() => handleOpen(item)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <CardContent
                    sx={{
                      py: 1.5,
                      px: 2,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    <Stack
                      direction='column'
                      spacing={0.5}
                      sx={{ alignItems: 'flex-start' }}
                    >
                      <Typography
                        variant='h6'
                        color='text.primary'
                        noWrap
                        sx={{ fontWeight: 700 }}
                      >
                        {title}
                      </Typography>
                      <Chip
                        size='small'
                        label={item.turn}
                        color='primary'
                        variant='outlined'
                        sx={{ mt: 0.25 }}
                      />
                    </Stack>
                    <Stack
                      direction='row'
                      spacing={1}
                      sx={{ mt: 0.5, alignItems: 'center' }}
                    >
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
      ))}
    </Box>
  );
};
