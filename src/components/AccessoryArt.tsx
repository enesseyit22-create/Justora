import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import type { AccessoryId, BackdropId } from '@/src/domain/types';

/**
 * Coordinates are for the tight companion (the character fills the frame).
 * Eyes sit at about (37, 44) and (64, 44). The hero portrait is the same
 * character, smaller and lower in the square, so it uses one scaled group.
 */
const HERO = 'translate(50.1 47) scale(0.61) translate(-50.7 -44.15)';

export function SceneArt({ id, size }: { id: Exclude<BackdropId, 'none'>; size: number }) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
      <Defs>
        {id === 'sunset' ? (
          <>
            <LinearGradient id={`${gid}sky`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFE7C8" />
              <Stop offset="0.55" stopColor="#F7B48A" />
              <Stop offset="1" stopColor="#E07A62" />
            </LinearGradient>
            <RadialGradient id={`${gid}sun`} cx="68" cy="40" rx="16" ry="16" fx="64" fy="36">
              <Stop offset="0" stopColor="#FFF6DE" />
              <Stop offset="0.45" stopColor="#FFD39A" />
              <Stop offset="1" stopColor="#FFD39A" stopOpacity="0" />
            </RadialGradient>
          </>
        ) : null}
        {id === 'meadow' ? (
          <LinearGradient id={`${gid}sky`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E7F4EA" />
            <Stop offset="0.62" stopColor="#F7F3EA" />
            <Stop offset="1" stopColor="#C9DDB4" />
          </LinearGradient>
        ) : null}
        {id === 'night' ? (
          <>
            <LinearGradient id={`${gid}sky`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#241C3A" />
              <Stop offset="0.7" stopColor="#3A315C" />
              <Stop offset="1" stopColor="#1A1428" />
            </LinearGradient>
            <RadialGradient id={`${gid}moon`} cx="66" cy="34" rx="12" ry="12" fx="63" fy="31">
              <Stop offset="0" stopColor="#FFF8EA" />
              <Stop offset="0.55" stopColor="#F0E2C4" />
              <Stop offset="1" stopColor="#F0E2C4" stopOpacity="0" />
            </RadialGradient>
          </>
        ) : null}
      </Defs>
      <RectFill id={`${gid}sky`} />
      {id === 'sunset' ? (
        <>
          <Circle cx="68" cy="40" r="16" fill={`url(#${gid}sun)`} />
          <Circle cx="68" cy="40" r="7" fill="#FFF3D4" />
          <Ellipse cx="28" cy="32" rx="10" ry="4" fill="#FFFFFF" opacity={0.38} />
          <Ellipse cx="40" cy="30" rx="8" ry="3.2" fill="#FFFFFF" opacity={0.28} />
          <Ellipse cx="50" cy="78" rx="40" ry="12" fill="#C85B48" opacity={0.35} />
          <Ellipse cx="58" cy="84" rx="34" ry="8" fill="#A8483C" opacity={0.28} />
        </>
      ) : null}
      {id === 'meadow' ? (
        <>
          <Circle cx="74" cy="28" r="7" fill="#FFF8DE" />
          <Circle cx="74" cy="28" r="12" fill="#FFF8DE" opacity={0.35} />
          <Ellipse cx="50" cy="74" rx="42" ry="16" fill="#8FB392" />
          <Ellipse cx="46" cy="82" rx="40" ry="12" fill="#6E8F72" />
          <Circle cx="30" cy="70" r="1.3" fill="#F6E7A8" />
          <Circle cx="62" cy="68" r="1.1" fill="#F3B7C4" />
          <Circle cx="70" cy="74" r="1.2" fill="#F6E7A8" />
        </>
      ) : null}
      {id === 'night' ? (
        <>
          <Circle cx="66" cy="34" r="14" fill={`url(#${gid}moon)`} />
          <Circle cx="66" cy="34" r="6.2" fill="#FFF8EA" />
          <Circle cx="69" cy="32" r="5.2" fill="#2A2344" opacity={0.35} />
          <Circle cx="28" cy="26" r="0.9" fill="#FFF6E4" />
          <Circle cx="38" cy="20" r="0.6" fill="#FFF6E4" />
          <Circle cx="46" cy="30" r="0.7" fill="#FFF6E4" />
          <Circle cx="24" cy="40" r="0.5" fill="#FFF6E4" />
          <Circle cx="52" cy="22" r="0.45" fill="#FFF6E4" />
          <Ellipse cx="50" cy="86" rx="40" ry="10" fill="#120E1C" opacity={0.85} />
        </>
      ) : null}
    </Svg>
  );
}

function RectFill({ id }: { id: string }) {
  return <Path d="M0 0H100V100H0Z" fill={`url(#${id})`} />;
}

export function WearArt({ id, size, hero = false }: { id: AccessoryId; size: number; hero?: boolean }) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <LinearGradient id={`${gid}cap`} x1="30" y1="14" x2="66" y2="36">
          <Stop offset="0" stopColor="#FFD0B8" />
          <Stop offset="0.42" stopColor="#F08362" />
          <Stop offset="1" stopColor="#D4533A" />
        </LinearGradient>
        <LinearGradient id={`${gid}brim`} x1="28" y1="34" x2="72" y2="40">
          <Stop offset="0" stopColor="#E07A58" />
          <Stop offset="1" stopColor="#B84332" />
        </LinearGradient>
        <LinearGradient id={`${gid}beret`} x1="36" y1="16" x2="72" y2="34">
          <Stop offset="0" stopColor="#E4D4F6" />
          <Stop offset="0.4" stopColor="#8E6CC4" />
          <Stop offset="1" stopColor="#5C438C" />
        </LinearGradient>
        <LinearGradient id={`${gid}scarf`} x1="28" y1="54" x2="72" y2="74">
          <Stop offset="0" stopColor="#D7E8D4" />
          <Stop offset="0.45" stopColor="#6E8F78" />
          <Stop offset="1" stopColor="#4E715C" />
        </LinearGradient>
        <LinearGradient id={`${gid}bow`} x1="46" y1="52" x2="74" y2="74">
          <Stop offset="0" stopColor="#FFD0C2" />
          <Stop offset="0.5" stopColor="#E15D32" />
          <Stop offset="1" stopColor="#B8432C" />
        </LinearGradient>
        <LinearGradient id={`${gid}glass`} x1="30" y1="38" x2="42" y2="50">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
        </LinearGradient>
        <RadialGradient id={`${gid}star`} cx="48" cy="18" rx="7" ry="7">
          <Stop offset="0" stopColor="#FFF6D4" />
          <Stop offset="0.55" stopColor="#F6C56B" />
          <Stop offset="1" stopColor="#E09A3A" />
        </RadialGradient>
        <RadialGradient id={`${gid}petal`} cx="72" cy="16" rx="4" ry="4">
          <Stop offset="0" stopColor="#FFE4D4" />
          <Stop offset="1" stopColor="#E8927A" />
        </RadialGradient>
      </Defs>
      <G transform={hero ? HERO : undefined}>
        {id === 'cap' ? <Cap gid={gid} /> : null}
        {id === 'beret' ? <Beret gid={gid} /> : null}
        {id === 'scarf' ? <Scarf gid={gid} /> : null}
        {id === 'ribbon' ? <Ribbon gid={gid} /> : null}
        {id === 'glasses' ? <Glasses gid={gid} round={false} /> : null}
        {id === 'rounds' ? <Glasses gid={gid} round /> : null}
        {id === 'flower' ? <Flower gid={gid} /> : null}
        {id === 'star' ? <Star gid={gid} /> : null}
      </G>
    </Svg>
  );
}

function Cap({ gid }: { gid: string }) {
  return (
    <G>
      <Ellipse cx="50" cy="37" rx="18" ry="3.2" fill="#6B5346" opacity={0.16} />
      <Path d="M34 34.5C34 22 41 15.5 50 15.5C59 15.5 66 22 66 34.5Z" fill={`url(#${gid}cap)`} stroke="#A33E2C" strokeWidth="0.8" />
      <Ellipse cx="45" cy="22" rx="7" ry="3.2" fill="#FFFFFF" opacity={0.38} />
      <Path d="M34 31.5H66" stroke="#C45A42" strokeWidth="2.4" strokeLinecap="round" />
      <Path d="M29 33.5Q50 40 71 33.5Q50 36.2 29 33.5Z" fill={`url(#${gid}brim)`} stroke="#9A3A2A" strokeWidth="0.6" />
      <Path d="M36 34Q50 37.4 64 34" stroke="#FFD8C8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </G>
  );
}

function Beret({ gid }: { gid: string }) {
  return (
    <G>
      <Ellipse cx="52" cy="31" rx="16" ry="3" fill="#3A2A22" opacity={0.16} />
      <Path
        d="M36 28C40 18 58 14 70 21C76 25 72 33 58 34C44 35 33 33 36 28Z"
        fill={`url(#${gid}beret)`}
        stroke="#4C3578"
        strokeWidth="0.7"
      />
      <Ellipse cx="48" cy="23" rx="7" ry="2.6" fill="#FFFFFF" opacity={0.32} />
      <Circle cx="68" cy="18.5" r="2.1" fill="#5A3E86" stroke="#3E2A62" strokeWidth="0.4" />
      <Path d="M66.5 20.2C64 23 60 25 56 25.5" stroke="#5A3E86" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </G>
  );
}

function Scarf({ gid }: { gid: string }) {
  return (
    <G>
      <Path d="M32 64C38 58 64 58 70 65C73 72 64 78 50 77C36 76 28 70 32 64Z" fill="#3A2A22" opacity={0.12} />
      <Path
        d="M32 62C38 56 64 56 70 63C73 70 64 76 50 75C36 74 28 68 32 62Z"
        fill={`url(#${gid}scarf)`}
        stroke="#3E5C48"
        strokeWidth="0.7"
      />
      <Path d="M38 61.5C46 58 58 58 66 62" stroke="#F4F7F1" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity={0.7} />
      <Path d="M36 68H66" stroke="#F6E7C1" strokeWidth="1.6" strokeLinecap="round" opacity={0.85} />
      <Path d="M62 70C66 76 64 82 58 83C62 78 60 72 62 70Z" fill="#4E715C" stroke="#3E5C48" strokeWidth="0.5" />
    </G>
  );
}

function Ribbon({ gid }: { gid: string }) {
  return (
    <G>
      <Ellipse cx="58" cy="71" rx="12" ry="3" fill="#3A2A22" opacity={0.14} />
      <Path d="M58 68C50 62 46 66 48 72C50 77 56 74 58 70Z" fill={`url(#${gid}bow)`} stroke="#9A3A2C" strokeWidth="0.55" />
      <Path d="M58 68C66 62 72 66 70 72C68 77 60 74 58 70Z" fill={`url(#${gid}bow)`} stroke="#9A3A2C" strokeWidth="0.55" />
      <Ellipse cx="52" cy="66" rx="2.4" ry="1.2" fill="#FFFFFF" opacity={0.35} />
      <Circle cx="58" cy="69" r="2.1" fill="#F7C2B0" stroke="#9A3A2C" strokeWidth="0.4" />
      <Path d="M56 71C54 76 51 80 48 81" stroke="#E15D32" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Path d="M60 71C62 77 65 80 68 81" stroke="#C24B34" strokeWidth="2" fill="none" strokeLinecap="round" />
    </G>
  );
}

function Glasses({ gid, round }: { gid: string; round: boolean }) {
  const r = round ? 5.4 : 5.2;
  const ry = round ? 3.6 : 3.1;
  const rim = round ? '#C9864A' : '#6B5346';
  const left = 37.1;
  const right = 64.3;
  const y = 43.4;
  return (
    <G>
      <Ellipse cx="50" cy={y + ry + 0.8} rx="16" ry="1.6" fill="#3A2A22" opacity={0.1} />
      <Ellipse cx={left} cy={y} rx={r} ry={ry} fill={`url(#${gid}glass)`} />
      <Ellipse cx={right} cy={y} rx={r} ry={ry} fill={`url(#${gid}glass)`} />
      <Ellipse cx={left} cy={y} rx={r} ry={ry} stroke={rim} strokeWidth={round ? 1.5 : 1.7} fill="none" />
      <Ellipse cx={right} cy={y} rx={r} ry={ry} stroke={rim} strokeWidth={round ? 1.5 : 1.7} fill="none" />
      <Path d={`M${left + r} ${y}H${right - r}`} stroke={rim} strokeWidth="1.5" strokeLinecap="round" />
      <Path d={`M${left - r} ${y + 0.3}L30 44.2`} stroke={rim} strokeWidth="1.3" strokeLinecap="round" />
      <Path d={`M${right + r} ${y + 0.3}L70 44.2`} stroke={rim} strokeWidth="1.3" strokeLinecap="round" />
      <Path d={`M${left - 1.6} ${y - 1.4}Q${left} ${y - 2.4} ${left + 2} ${y - 1.3}`} stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity={0.8} />
      <Path d={`M${right - 1.6} ${y - 1.4}Q${right} ${y - 2.4} ${right + 2} ${y - 1.3}`} stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity={0.8} />
    </G>
  );
}

function Flower({ gid }: { gid: string }) {
  const spots: Array<[number, number]> = [
    [71, 13],
    [74.2, 15.6],
    [71, 18.4],
    [67.8, 15.6],
  ];
  return (
    <G>
      <Ellipse cx="71" cy="18" rx="4" ry="1.3" fill="#3A2A22" opacity={0.15} />
      {spots.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill={`url(#${gid}petal)`} stroke="#C96B58" strokeWidth="0.35" />
      ))}
      <Circle cx="71" cy="15.6" r="1.45" fill="#F6D56A" stroke="#E0B04A" strokeWidth="0.3" />
      <Path d="M71 18.2C70.4 21 68.5 23 67 23.6" stroke="#6E8F72" strokeWidth="1" fill="none" strokeLinecap="round" />
    </G>
  );
}

function Star({ gid }: { gid: string }) {
  return (
    <G>
      <Ellipse cx="50" cy="26" rx="6" ry="1.6" fill="#3A2A22" opacity={0.16} />
      <Path
        d="M50 14.2L52.1 19.4H57.6L53.2 22.6L54.8 27.8L50 24.6L45.2 27.8L46.8 22.6L42.4 19.4H47.9Z"
        fill={`url(#${gid}star)`}
        stroke="#C4842E"
        strokeWidth="0.45"
      />
      <Path d="M48.2 17.2L49.2 19.2" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity={0.8} />
    </G>
  );
}
