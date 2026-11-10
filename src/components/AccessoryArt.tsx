import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

import type { AccessoryId, BackdropId } from '@/src/domain/types';

export function SceneArt({ id, size }: { id: Exclude<BackdropId, 'none'>; size: number }) {
  const sunset = id === 'sunset';
  const meadow = id === 'meadow';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sunset ? '#FFD7B5' : meadow ? '#D7EBD4' : '#2A2440'} />
          <Stop offset="1" stopColor={sunset ? '#F08A62' : meadow ? '#8FB39A' : '#12101A'} />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="54" r="34" fill="url(#sky)" />
      {sunset ? <Circle cx="62" cy="46" r="8" fill="#FFE7C2" /> : null}
      {meadow ? <Ellipse cx="50" cy="72" rx="22" ry="6" fill="#6E8F62" /> : null}
      {id === 'night' ? (
        <>
          <Circle cx="64" cy="40" r="7" fill="#F6F1EA" />
          <Circle cx="67" cy="38" r="6" fill="#2A2440" />
          <Circle cx="38" cy="36" r="1.2" fill="#F6F1EA" />
          <Circle cx="48" cy="30" r="1" fill="#F6F1EA" />
        </>
      ) : null}
    </Svg>
  );
}

export function WearArt({ id, size }: { id: AccessoryId; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }} pointerEvents="none">
      {id === 'flower' ? (
        <>
          <Circle cx="72" cy="30" r="4" fill="#F0A88A" />
          <Circle cx="78" cy="34" r="4" fill="#E7A08A" />
          <Circle cx="72" cy="38" r="4" fill="#F0A88A" />
          <Circle cx="66" cy="34" r="4" fill="#E7A08A" />
          <Circle cx="72" cy="34" r="2.2" fill="#F6E27A" />
        </>
      ) : null}
      {id === 'cap' ? (
        <Path d="M30 40c2-14 38-16 42-2 1 2-8 4-14 4H38c-4 0-8-1-8-2z" fill="#E15D32" />
      ) : null}
      {id === 'beret' ? <Ellipse cx="52" cy="30" rx="18" ry="10" fill="#6D4CB3" transform="rotate(-12 52 30)" /> : null}
      {id === 'scarf' ? <Path d="M32 60c8 8 28 8 36 0 2 6-4 12-10 12H42c-6 0-12-6-10-12z" fill="#6E8F78" /> : null}
      {id === 'ribbon' ? (
        <>
          <Path d="M34 58c10 6 22 6 32 0" stroke="#E15D32" strokeWidth="4" fill="none" strokeLinecap="round" />
          <Path d="M58 60c6 8 4 16-2 18" stroke="#E15D32" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {id === 'glasses' ? (
        <>
          <Circle cx="40" cy="46" r="7" stroke="#2C2825" strokeWidth="2.4" fill="none" />
          <Circle cx="60" cy="46" r="7" stroke="#2C2825" strokeWidth="2.4" fill="none" />
          <Path d="M47 46h6" stroke="#2C2825" strokeWidth="2" />
        </>
      ) : null}
      {id === 'rounds' ? (
        <>
          <Circle cx="40" cy="46" r="8" stroke="#2C2825" strokeWidth="2.2" fill="rgba(255,255,255,0.25)" />
          <Circle cx="62" cy="46" r="8" stroke="#2C2825" strokeWidth="2.2" fill="rgba(255,255,255,0.25)" />
          <Path d="M48 46h6" stroke="#2C2825" strokeWidth="2" />
        </>
      ) : null}
      {id === 'star' ? <Path d="M50 16l2.2 6.2H59l-5 3.8 1.9 6.2L50 28.6 44.1 32l1.9-6.2-5-3.8h6.8z" fill="#F0A88A" /> : null}
    </Svg>
  );
}
