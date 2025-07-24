import { Box, List, ListItem } from '@mui/material';

import { Index } from './Index.tsx';

export const Navbar = () => {
  return (
    <>
      <Box sx={{ width: '100%' }}>
        <List sx={{ display: 'flex', flexDirection: 'row' }}>
          <ListItem>
            <Index />
          </ListItem>
          <ListItem sx={{ boxSizing: 'content-box', maxWidth: '60px' }}>
            <img
              src='../../../public/img/school_logo.jpg'
              alt='Logo IPETYM 69'
              className='max-w-15'
            />
          </ListItem>
        </List>
      </Box>
    </>
  );
};
