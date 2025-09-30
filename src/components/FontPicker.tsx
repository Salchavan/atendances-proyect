import { Box, List, ListItemButton, Typography } from '@mui/material';
import { PRESET_FONTS, ensureGoogleFontLoaded } from '../utils/fonts';
import { useStore } from '../Store/Store';

export const FontPicker = () => {
  const setFontFamily = useStore((s) => s.setFontFamily);
  const closeDialog = useStore((s) => s.closeDialog);

  const handleSelect = (family: string) => {
    ensureGoogleFontLoaded(family, [300, 400, 500, 700]);
    // Compose fallbacks
    const composed = `${family}, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
    setFontFamily(composed);
    closeDialog();
  };

  return (
    <Box>
      <List>
        {PRESET_FONTS.map((f) => (
          <ListItemButton key={f} onClick={() => handleSelect(f)}>
            <Typography sx={{ fontFamily: `${f}, sans-serif` }}>{f}</Typography>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};
