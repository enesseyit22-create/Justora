import type { SurfaceState } from '@/src/services/surfaces';
import type { FocusProps } from '@/widgets/FocusWidget';

type ActivityHandle = {
  update: (props: FocusProps) => Promise<void>;
  end: (policy?: 'immediate') => Promise<void>;
};

type WidgetHandle = {
  updateSnapshot: (props: FocusProps) => void;
  updateTimeline: (entries: { date: Date; props: FocusProps }[]) => void;
};

type ActivityFactory = {
  start: (props: FocusProps, url?: string) => ActivityHandle;
  getInstances: () => ActivityHandle[];
};

let widget: WidgetHandle | null = null;
let activity: ActivityFactory | null = null;
let instance: ActivityHandle | null = null;
let failed = false;

async function load(): Promise<void> {
  if (failed || widget) return;
  try {
    const widgetModule = await import('../../widgets/FocusWidget');
    const activityModule = await import('../../widgets/FocusActivity');
    widget = widgetModule.default;
    activity = activityModule.default;
    const existing = activity.getInstances();
    instance = existing[0] ?? null;
  } catch {
    failed = true;
    widget = null;
    activity = null;
  }
}

function propsAt(state: SurfaceState, at: number): FocusProps {
  const remaining =
    state.mode === 'running' && state.endsAt
      ? Math.max(0, state.endsAt - at)
      : Math.max(0, state.durationMs - state.accumulatedMs);
  const fraction = state.durationMs > 0 ? Math.min(1, remaining / state.durationMs) : 0;
  const minutes = Math.max(0, Math.ceil(remaining / 60_000));
  return {
    title: state.title,
    minutes: String(minutes),
    detail: state.detail,
    fraction,
  };
}

export async function surfacesSupported(): Promise<boolean> {
  await load();
  return widget != null;
}

export async function syncFocusSurface(state: SurfaceState): Promise<void> {
  await load();
  if (!widget) return;
  try {
    if (state.mode === 'running' && state.endsAt) {
      const entries: { date: Date; props: FocusProps }[] = [];
      let cursor = Date.now();
      while (cursor <= state.endsAt && entries.length < 90) {
        entries.push({ date: new Date(cursor), props: propsAt(state, cursor) });
        cursor += 60_000;
      }
      entries.push({ date: new Date(state.endsAt), props: propsAt({ ...state, endsAt: state.endsAt }, state.endsAt) });
      widget.updateTimeline(entries);
    } else {
      widget.updateSnapshot(propsAt(state, Date.now()));
    }
  } catch {
    // Widget extension is absent in Expo Go.
  }

  if (!activity) return;
  try {
    if (state.mode === 'idle') {
      if (!instance) {
        const existing = activity.getInstances();
        instance = existing[0] ?? null;
      }
      if (instance) {
        await instance.end('immediate');
        instance = null;
      }
      return;
    }
    const props = propsAt(state, Date.now());
    if (!instance) {
      const existing = activity.getInstances();
      instance = existing[0] ?? activity.start(props, 'justora://timer');
    }
    await instance.update(props);
  } catch {
    instance = null;
  }
}
