import { Box } from '@mui/material';

import { useEffect } from 'react';

export const Perfil = () => {
  const selectedUser = 'Pajero maximo SSR'; // Aquí deberías obtener el usuario seleccionado dinámicamente
  useEffect(() => {
    document.title = `Perfil - ${selectedUser}`;
  }, [selectedUser]);
  return (
    <Box className='h-[100vh] w-[100vw] p-2 grid grid-cols-10 grid-rows-10 gap-2'>
      holaaaa
    </Box>
  );
};
