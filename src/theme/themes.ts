import type { ThemeId } from '@/src/domain/types';

export type Palette = {
  bg: string;
  card: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  wedge: string;
  wedgeTrack: string;
  ring: string;
  sage: string;
  sageSoft: string;
  line: string;
  shadow: string;
  break: string;
  cta: string;
  ctaInk: string;
};

export type ThemePair = { light: Palette; dark: Palette };

const justora: ThemePair = {
  light: {
    bg: '#F6F1EA',
    card: '#FFFFFF',
    ink: '#2C2825',
    muted: '#8D8178',
    accent: '#F0A88A',
    accentInk: '#FFF8F4',
    wedge: '#F6C4AE',
    wedgeTrack: '#FBF7F2',
    ring: '#EFE4D8',
    sage: '#6E8F78',
    sageSoft: '#E7F1E8',
    line: '#EFE4D8',
    shadow: '#6B5346',
    break: '#8FB39A',
    cta: '#E15D32',
    ctaInk: '#FFFFFF',
  },
  dark: {
    bg: '#1C1714',
    card: '#2A2320',
    ink: '#F6F1EA',
    muted: '#B6A89E',
    accent: '#E7A08A',
    accentInk: '#2C1812',
    wedge: '#E7A08A',
    wedgeTrack: '#3A302B',
    ring: '#3A302B',
    sage: '#A9C4B0',
    sageSoft: '#24302A',
    line: '#3A302B',
    shadow: '#000000',
    break: '#8FB39A',
    cta: '#FF7A45',
    ctaInk: '#1A0C08',
  },
};

function pair(light: Partial<Palette>, dark: Partial<Palette>): ThemePair {
  return {
    light: { ...justora.light, ...light },
    dark: { ...justora.dark, ...dark },
  };
}

export const themes: Record<ThemeId, ThemePair> = {
  justora,
  tide: pair(
    { bg: '#F3F7F6', accent: '#7EB8B0', wedge: '#B7DDD6', sage: '#5E8F86', ring: '#E3EEEC', cta: '#0E7C78', ctaInk: '#FFFFFF' },
    { bg: '#121918', accent: '#8FCFC6', wedge: '#7EB8B0', card: '#1C2624', cta: '#3DDFD4', ctaInk: '#06221F' },
  ),
  grove: pair(
    { bg: '#F4F6F1', accent: '#8FAF86', wedge: '#C9DCC0', sage: '#6E8F62', ring: '#E6EEE3', cta: '#2F7A3A', ctaInk: '#FFFFFF' },
    { bg: '#141814', accent: '#A9C9A0', wedge: '#8FAF86', card: '#1E261E', cta: '#8BE08A', ctaInk: '#10210F' },
  ),
  dusk: pair(
    { bg: '#F6F3F8', accent: '#B7A4D6', wedge: '#D9CBEA', sage: '#8E86A8', ring: '#EBE6F2', cta: '#6D4CB3', ctaInk: '#FFFFFF' },
    { bg: '#17141C', accent: '#CDBFE6', wedge: '#B7A4D6', card: '#241F2C', cta: '#D4C2FF', ctaInk: '#1A1228' },
  ),
  ink: pair(
    { bg: '#F7F6F3', ink: '#161616', accent: '#2C2825', accentInk: '#F7F6F3', wedge: '#E7A08A', muted: '#5C5854', cta: '#E15D32', ctaInk: '#FFFFFF' },
    { bg: '#101010', card: '#1A1A1A', ink: '#F4F1EA', accent: '#F0A88A', wedge: '#F0A88A', muted: '#C8C2BA', cta: '#FF7A45', ctaInk: '#1A0C08' },
  ),
};

export const themeOrder: ThemeId[] = ['justora', 'tide', 'grove', 'dusk', 'ink'];

export const font = {
  body: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
};
