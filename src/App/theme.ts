import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#6d33c2',
      darker: '#6d33c2',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
});

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: React.CSSProperties['color'];
    };
  }
  
  interface Palette {
    neutral: Palette['primary'];
  }
  
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
  
  interface PaletteColor {
    darker?: string;
  }
  
  interface SimplePaletteColorOptions {
    darker?: string;
  }
  
  interface ThemeOptions {
    status: {
      danger: React.CSSProperties['color'];
    };
  }
}
