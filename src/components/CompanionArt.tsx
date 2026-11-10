import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { CardId } from '@/src/domain/types';

type Mood = 'soft' | 'joy' | 'sleep' | 'wink' | 'wow' | 'proud' | 'focus' | 'shy';

type Look = {
  body: string;
  belly: string;
  ear: string;
  cheek: string;
  mood: Mood;
  tilt?: number;
};

const EYE = '#3A2A22';

const LOOKS: Record<CardId, Look> = {
  dawnWedge: { body: '#F3C39A', belly: '#FBE6D2', ear: '#E7A56E', cheek: '#F3A898', mood: 'sleep', tilt: -6 },
  softRain: { body: '#E7D0C0', belly: '#F8EDE4', ear: '#C9B0A4', cheek: '#F0B0B8', mood: 'soft' },
  focusPebble: { body: '#E7C8A4', belly: '#F8E6D0', ear: '#C9956A', cheek: '#E8A090', mood: 'focus' },
  openPage: { body: '#F0CBA6', belly: '#FFF3E4', ear: '#E0A878', cheek: '#F0A8A0', mood: 'wow', tilt: 4 },
  sageLeaf: { body: '#E4D2A8', belly: '#F7EBD4', ear: '#C9A56E', cheek: '#E8B0A0', mood: 'soft' },
  quietLamp: { body: '#F0C896', belly: '#FFF0DC', ear: '#E0A56A', cheek: '#F0B0A4', mood: 'sleep', tilt: 5 },
  justSpark: { body: '#F6C4A4', belly: '#FFE8D6', ear: '#E89A68', cheek: '#F09898', mood: 'joy', tilt: -4 },
  tideShell: { body: '#D7E4D4', belly: '#F4F8F2', ear: '#A9C4B4', cheek: '#F0B4B8', mood: 'wink' },
  groveMoss: { body: '#D5D0A4', belly: '#F3F0D4', ear: '#A8A86A', cheek: '#E8B8A0', mood: 'shy', tilt: 3 },
  duskRibbon: { body: '#F0C4D0', belly: '#FFF0F4', ear: '#E0A0B4', cheek: '#F090A8', mood: 'joy', tilt: -3 },
  inkDot: { body: '#C4A898', belly: '#F6E6D8', ear: '#A88878', cheek: '#E8A098', mood: 'focus' },
  weekBloom: { body: '#F3C4C8', belly: '#FFF0F2', ear: '#E8A0A8', cheek: '#F098A8', mood: 'joy' },
  streakFlame: { body: '#F0B090', belly: '#FFE4D4', ear: '#E08060', cheek: '#F08880', mood: 'proud', tilt: -5 },
  companionBloom: { body: '#F6C8B0', belly: '#FFF1E6', ear: '#E8A888', cheek: '#F0A0A8', mood: 'proud' },
  goldenWedge: { body: '#F0D48A', belly: '#FFF6D8', ear: '#E0B85A', cheek: '#F0B0A0', mood: 'proud', tilt: 2 },
  nightOrbit: { body: '#B7C4D4', belly: '#F4F0E8', ear: '#8AA0B8', cheek: '#E8B0C0', mood: 'sleep', tilt: -4 },
  proAurora: { body: '#C8E8DC', belly: '#F4FFF8', ear: '#8EC8B8', cheek: '#F0B0C8', mood: 'wow' },
  proConstellation: { body: '#C8B8DC', belly: '#F6F0FA', ear: '#A898C4', cheek: '#E8B0C8', mood: 'wow', tilt: 4 },
  proGilded: { body: '#F0D090', belly: '#FFF4DC', ear: '#D4B060', cheek: '#F0B098', mood: 'wink' },
  proMoonwell: { body: '#B7D4D0', belly: '#F2FAF8', ear: '#7EAEA8', cheek: '#E8B4C0', mood: 'soft', tilt: -2 },
};

function spark(x: number, y: number, r: number, fill: string) {
  return `M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`;
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'sleep') {
    return (
      <>
        <Path d="M42 70 Q48 64 54 70" stroke={EYE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <Path d="M66 70 Q72 64 78 70" stroke={EYE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'proud') {
    return (
      <>
        <Path d="M42 72 Q48 64 54 72" stroke={EYE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <Path d="M66 72 Q72 64 78 72" stroke={EYE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'wink') {
    return (
      <>
        <Circle cx="48" cy="70" r="3.2" fill={EYE} />
        <Path d="M66 70 Q72 64 78 70" stroke={EYE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'focus') {
    return (
      <>
        <Ellipse cx="48" cy="70" rx="3.6" ry="2.3" fill={EYE} />
        <Ellipse cx="72" cy="70" rx="3.6" ry="2.3" fill={EYE} />
      </>
    );
  }
  const r = mood === 'wow' ? 4.4 : 3.2;
  const dx = mood === 'shy' ? -2 : 0;
  return (
    <>
      <Circle cx={48 + dx} cy="70" r={r} fill={EYE} />
      <Circle cx={72 + dx} cy="70" r={r} fill={EYE} />
      {mood === 'wow' ? (
        <>
          <Circle cx={46.5 + dx} cy="68.4" r="1.3" fill="#FFF8F4" />
          <Circle cx={70.5 + dx} cy="68.4" r="1.3" fill="#FFF8F4" />
        </>
      ) : null}
    </>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === 'wow') return <Ellipse cx="60" cy="88" rx="4" ry="5" fill={EYE} />;
  const d =
    mood === 'joy' || mood === 'wink' || mood === 'proud'
      ? 'M46 82 Q60 96 74 82'
      : mood === 'focus'
        ? 'M52 86 Q60 90 68 86'
        : mood === 'sleep'
          ? 'M54 84 Q60 88 66 84'
          : 'M50 84 Q60 92 70 84';
  return <Path d={d} stroke={EYE} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
}

function Bear({ look }: { look: Look }) {
  return (
    <G transform={look.tilt ? `rotate(${look.tilt} 60 78)` : undefined}>
      <Ellipse cx="32" cy="42" rx="14" ry="16" fill={look.ear} />
      <Ellipse cx="88" cy="42" rx="14" ry="16" fill={look.ear} />
      <Ellipse cx="32" cy="44" rx="7" ry="8" fill={look.belly} />
      <Ellipse cx="88" cy="44" rx="7" ry="8" fill={look.belly} />
      <Ellipse cx="60" cy="80" rx="44" ry="40" fill={look.body} />
      <Ellipse cx="60" cy="98" rx="26" ry="18" fill={look.belly} />
      <Eyes mood={look.mood} />
      <Ellipse cx="40" cy="86" rx="6.5" ry="3.6" fill={look.cheek} />
      <Ellipse cx="80" cy="86" rx="6.5" ry="3.6" fill={look.cheek} />
      <Mouth mood={look.mood} />
    </G>
  );
}

function Backdrop({ id }: { id: CardId }) {
  switch (id) {
    case 'dawnWedge':
      return (
        <>
          <Circle cx="98" cy="28" r="14" fill="#F6D56A" />
          <Circle cx="98" cy="28" r="8" fill="#FFF6C8" />
        </>
      );
    case 'softRain':
      return (
        <>
          <Ellipse cx="28" cy="30" rx="16" ry="10" fill="#FFFFFF" opacity={0.9} />
          <Ellipse cx="42" cy="26" rx="12" ry="9" fill="#FFFFFF" />
          <Path d="M22 46 q1 8 0 14" stroke="#7EB0D4" strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M34 50 q1 8 0 14" stroke="#7EB0D4" strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M46 46 q1 8 0 12" stroke="#9EC4DE" strokeWidth={2.2} strokeLinecap="round" />
        </>
      );
    case 'justSpark':
      return (
        <>
          <Path d={spark(18, 36, 7, '#F6D56A')} />
          <Path d={spark(100, 24, 8, '#FFF6C8')} />
          <Path d={spark(104, 52, 5, '#F0A88A')} />
        </>
      );
    case 'quietLamp':
      return (
        <>
          <Circle cx="98" cy="36" r="16" fill="#F6D56A" opacity={0.45} />
          <Path d="M90 18 H110 L105 36 H95 Z" fill="#F6D56A" />
          <Rect x="98" y="36" width="4" height="10" rx="1" fill="#C4A484" />
          <Rect x="93" y="46" width="14" height="3" rx="1" fill="#C4A484" />
        </>
      );
    case 'streakFlame':
      return (
        <G>
          <Path d="M98 18 C108 34 114 44 114 58 C114 72 104 80 94 80 C84 80 76 72 76 58 C76 42 88 30 98 18 Z" fill="#E07A55" />
          <Path d="M98 40 C104 50 106 56 106 64 C106 72 100 76 96 76 C90 76 88 70 88 64 C88 54 94 48 98 40 Z" fill="#F6D56A" />
        </G>
      );
    case 'nightOrbit':
      return (
        <>
          <Circle cx="98" cy="30" r="12" fill="#F6E7C4" />
          <Circle cx="104" cy="26" r="10" fill="#D5DEE8" />
          <Path d={spark(22, 26, 5, '#F6E7C4')} />
        </>
      );
    case 'proAurora':
      return (
        <>
          <Path d="M8 36 Q40 16 72 34 Q98 48 114 26" stroke="#7ED0C0" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
          <Path d="M6 50 Q44 28 80 46 Q104 58 116 40" stroke="#C4B0E4" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
          <Path d="M10 62 Q50 44 88 58" stroke="#F6E7A8" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
        </>
      );
    case 'proConstellation':
      return (
        <>
          <Path d={spark(22, 24, 6, '#F6E7C4')} />
          <Path d={spark(100, 22, 7, '#FFF8E8')} />
          <Path d={spark(108, 48, 4, '#E4D4F6')} />
          <Path d={spark(16, 52, 4, '#F6E7C4')} />
          <Path d="M22 24 L100 22 L108 48" stroke="#F6E7C4" strokeWidth={1} opacity={0.7} />
        </>
      );
    case 'proMoonwell':
      return (
        <>
          <Circle cx="96" cy="26" r="11" fill="#F6E7C4" />
          <Circle cx="101" cy="22" r="9" fill="#D5E8E6" />
          <Ellipse cx="60" cy="128" rx="28" ry="6" fill="#7EB8B0" opacity={0.35} />
        </>
      );
    default:
      return null;
  }
}

function Foreground({ id }: { id: CardId }) {
  switch (id) {
    case 'focusPebble':
      return (
        <>
          <Ellipse cx="60" cy="124" rx="18" ry="8" fill="#C4B09A" />
          <Ellipse cx="54" cy="122" rx="7" ry="3" fill="#E7D7C4" />
        </>
      );
    case 'openPage':
      return (
        <G>
          <Rect x="76" y="96" width="28" height="22" rx="3" fill="#FFF8F0" stroke="#C4A484" strokeWidth={1.4} />
          <Path d="M80 102 H98 M80 107 H96 M80 112 H94" stroke="#C4A484" strokeWidth={1.3} strokeLinecap="round" />
        </G>
      );
    case 'sageLeaf':
      return (
        <G>
          <Path d="M60 16 C80 28 82 50 60 60 C38 50 40 28 60 16 Z" fill="#6E8F62" />
          <Path d="M60 22 V54" stroke="#4E6A48" strokeWidth={1.4} />
        </G>
      );
    case 'tideShell':
      return (
        <G>
          <Path d="M84 102 C100 100 108 114 94 122 C80 116 76 106 84 102 Z" fill="#F4E6D4" />
          <Path d="M88 106 C92 112 94 116 96 120" stroke="#E0C4A8" strokeWidth={1.4} fill="none" />
          <Path d="M90 104 C96 110 98 114 98 118" stroke="#E0C4A8" strokeWidth={1.2} fill="none" />
        </G>
      );
    case 'groveMoss':
      return (
        <>
          <Circle cx="44" cy="34" r="9" fill="#6E8F62" />
          <Circle cx="58" cy="26" r="10" fill="#8FAF86" />
          <Circle cx="72" cy="32" r="8" fill="#5E7A54" />
        </>
      );
    case 'duskRibbon':
      return (
        <G>
          <Path d="M20 46 Q8 36 18 30 Q30 38 20 46 Q32 54 20 62 Q8 54 20 46 Z" fill="#E07AA0" />
          <Circle cx="20" cy="46" r="3.2" fill="#C45B84" />
        </G>
      );
    case 'inkDot':
      return (
        <G>
          <Circle cx="48" cy="70" r="9" fill="none" stroke="#2C2825" strokeWidth={2} />
          <Circle cx="74" cy="70" r="9" fill="none" stroke="#2C2825" strokeWidth={2} />
          <Path d="M57 70 H65" stroke="#2C2825" strokeWidth={2} />
          <Circle cx="96" cy="96" r="5" fill="#2C2825" />
        </G>
      );
    case 'weekBloom':
    case 'companionBloom':
      return (
        <G>
          <Circle cx="78" cy="30" r="7" fill="#F2A0B8" />
          <Circle cx="70" cy="24" r="7" fill="#F4B0C4" />
          <Circle cx="86" cy="24" r="7" fill="#F4B0C4" />
          <Circle cx="74" cy="16" r="6" fill="#F2A0B8" />
          <Circle cx="84" cy="16" r="6" fill="#F2A0B8" />
          <Circle cx="78" cy="23" r="4" fill="#F0D27A" />
        </G>
      );
    case 'goldenWedge':
      return <Path d="M38 40 L46 24 L54 38 L60 18 L66 38 L74 24 L82 40 Z" fill="#E7C15A" stroke="#C9A44A" strokeWidth={1} />;
    case 'proGilded':
      return (
        <>
          <Path d="M30 96 Q60 112 90 96 Q94 110 60 118 Q26 110 30 96 Z" fill="#C9A44A" />
          <Path d={spark(96, 36, 6, '#F6D56A')} />
        </>
      );
    default:
      return null;
  }
}

export function CardArt({
  id,
  colors,
  width,
  framed = true,
}: {
  id: CardId;
  colors: [string, string, string];
  width: number;
  framed?: boolean;
}) {
  const height = framed ? Math.round(width * 1.28) : Math.round(width * 1.05);
  const look = LOOKS[id];
  return (
    <Svg width={width} height={height} viewBox={framed ? '0 0 120 154' : '8 8 104 120'}>
      {framed ? (
        <Defs>
          <LinearGradient id={`card-${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[2]} />
          </LinearGradient>
        </Defs>
      ) : null}
      {framed ? <Rect x="4" y="4" width="112" height="146" rx="18" fill={`url(#card-${id})`} /> : null}
      <G transform="translate(0 -10)">
        <Backdrop id={id} />
        <Bear look={look} />
        <Foreground id={id} />
      </G>
    </Svg>
  );
}
