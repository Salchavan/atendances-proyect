import { List, ListItem } from '@mui/material';

import { Index } from './Index.tsx';

export const Navbar = () => {
  return (
    <List
      sx={{ display: 'flex', flexDirection: 'row' }}
      className='col-span-5 col-start-3'
    >
      <ListItem>
        <Index />
      </ListItem>
      <ListItem sx={{ boxSizing: 'content-box', maxWidth: '60px' }}>
        <img
          src='../../../public/img/school_logo.png'
          alt='Logo IPETYM 69'
          className='max-w-15'
        />
      </ListItem>
    </List>
  );
};
