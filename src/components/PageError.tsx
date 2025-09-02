import { Box, Button, Typography, IconButton } from '@mui/material';
import { useLocalStore } from '../store/localStore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const PageError = () => {
  const setPage = useLocalStore((store) => store.setPage);
  return (
    <Box className='realtive'>
      <Button
        onClick={() => setPage('main')}
        className='absolute top-2.5 left-2.5'
        variant='contained'
        color='primary'
      >
        <IconButton>
          <ArrowBackIcon sx={{ color: '#ffffff' }} />
        </IconButton>
        Volver
      </Button>
      <Box className='flex flex-col items-center justify-center p-8'>
        <Typography
          variant='h3'
          className='text-center mb-8 text-4xl md:text-5xl font-bold text-gray-800'
        >
          PAGINA EN CONSTRUCCION (o no encontrada)
        </Typography>
        <img
          className='max-w-[35%] rounded-lg shadow-lg'
          src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2F736x%2F91%2F09%2F79%2F910979a5f0722da3fccb2e1032dc3100.jpg&f=1&nofb=1&ipt=b1eb33add1f308bd8f3ea6068bb61612305e0779c2fb3468b4095f57d402adb6'
          alt='Página en construcción'
        />
      </Box>
    </Box>
  );
};
