export type SurfaceState = {
  title: string;
  detail: string;
  mode: 'running' | 'paused' | 'idle';
  endsAt: number | null;
  durationMs: number;
  accumulatedMs: number;
};

export async function syncFocusSurface(_state: SurfaceState): Promise<void> {}

export async function surfacesSupported(): Promise<boolean> {
  return false;
}
