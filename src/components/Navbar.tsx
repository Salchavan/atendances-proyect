import { List, ListItem } from '@mui/material';

import { Index } from './Index.tsx';

interface NavbarProps {
  grid: string;
}

export const Navbar = ({ grid }: NavbarProps) => {
  return (
    <List sx={{ display: 'flex', flexDirection: 'row' }} className={grid}>
      <ListItem>
        <Index />
      </ListItem>
      <ListItem sx={{ boxSizing: 'content-box', maxWidth: '60px' }}>
        <img
          src='https://www.ipetym69.edu.ar/images/colegiologo.png'
          alt='Logo IPETYM 69'
          className='max-w-15'
        />
      </ListItem>
    </List>
  );
};
