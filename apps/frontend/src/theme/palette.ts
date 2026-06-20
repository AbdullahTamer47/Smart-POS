import type { PaletteMode, CSSProperties } from '@mui/material';

const M3_SYS_LIGHT = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  background: '#FEF7FF',
  onBackground: '#1D1B20',
  surface: '#FEF7FF',
  onSurface: '#1D1B20',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  scrim: '#000000',
  success: '#1B7A3D',
  warning: '#B86E00',
  info: '#2A6B9C',
};

const M3_SYS_DARK = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  background: '#1D1B20',
  onBackground: '#E6E1E5',
  surface: '#1D1B20',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
  shadow: '#000000',
  scrim: '#000000',
  success: '#4ADE80',
  warning: '#FBBF24',
  info: '#38BDF8',
};

export function getM3Palette(mode: PaletteMode) {
  const tokens = mode === 'dark' ? M3_SYS_DARK : M3_SYS_LIGHT;

  return {
    mode,
    primary: {
      main: tokens.primary,
      contrastText: tokens.onPrimary,
      light: tokens.primaryContainer,
      dark: tokens.primary,
    },
    secondary: {
      main: tokens.secondary,
      contrastText: tokens.onSecondary,
      light: tokens.secondaryContainer,
      dark: tokens.secondary,
    },
    error: {
      main: tokens.error,
      light: tokens.errorContainer,
      dark: tokens.error,
    },
    warning: {
      main: tokens.warning,
    },
    info: {
      main: tokens.info,
    },
    success: {
      main: tokens.success,
    },
    background: {
      default: tokens.background,
      paper: tokens.surface,
    },
    text: {
      primary: tokens.onBackground,
      secondary: tokens.onSurfaceVariant,
      disabled: tokens.outline,
    },
    divider: tokens.outlineVariant,
    action: {
      active: tokens.onSurfaceVariant,
      hover: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      selected: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      disabled: tokens.outline,
      disabledBackground: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      focus: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    },
    tonalOffset: 0.2,
  };
}

export const glassStyles = (mode: PaletteMode): CSSProperties => ({
  background: mode === 'dark'
    ? 'rgba(29, 27, 32, 0.7)'
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
  borderRadius: 16,
});

export const glassCardSx = (mode: PaletteMode) => ({
  background: mode === 'dark'
    ? 'rgba(29, 27, 32, 0.65)'
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'}`,
  borderRadius: 4,
  boxShadow: mode === 'dark'
    ? '0px 4px 24px rgba(0,0,0,0.4)'
    : '0px 4px 24px rgba(0,0,0,0.06)',
});

export const gradientBg = (mode: PaletteMode): CSSProperties => ({
  background: mode === 'dark'
    ? 'linear-gradient(135deg, #1D1B20 0%, #2D1B3E 30%, #1B2D3E 60%, #1D1B20 100%)'
    : 'linear-gradient(135deg, #FEF7FF 0%, #F3E5FF 30%, #E3F2FD 60%, #FEF7FF 100%)',
});