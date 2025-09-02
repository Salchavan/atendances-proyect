import { useEffect, useState } from 'react';
import { useLocalStore } from '../store/localStore';

import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';

export const PageMenu = () => {
  const setPage = useLocalStore((store) => store.setPage);
  const pages = ['login', 'main', 'statics'];

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div className='absolute top-5 right-5 w-64 bg-white p-4 rounded-xl shadow-lg z-50'>
      <Autocomplete
        options={pages}
        onChange={(_, newValue) => {
          if (newValue) {
            setPage(newValue);
            setVisible(false);
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label='Seleccione una página' />
        )}
      />
    </div>
  );
};
