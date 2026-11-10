export type { SurfaceState } from '@/src/services/surfaces';

export async function syncFocusSurface(): Promise<void> {}

export async function surfacesSupported(): Promise<boolean> {
  return false;
}
