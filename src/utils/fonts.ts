const GOOGLE_BASE = 'https://fonts.googleapis.com/css2';

export function ensureGoogleFontLoaded(
  family: string,
  weights: number[] = [400]
) {
  if (!family) return;
  const id = `gf-${family.replace(/\s+/g, '-')}-${weights.join('-')}`;
  if (document.getElementById(id)) return; // already added

  // Build a proper ital,wght axis for Google Fonts API (e.g., @0,400;0,500;0,700)
  const wght = weights.map((wt) => `0,${wt}`).join(';');
  const href = `${GOOGLE_BASE}?family=${encodeURIComponent(
    family
  )}:ital,wght@${wght}&display=swap`;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export const PRESET_FONTS: string[] = [
  'Poppins',
  'Inter',
  'Roboto',
  'Nunito',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Source Sans 3',
];
