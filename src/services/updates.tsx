import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { PLACEHOLDER_EAS_PROJECT_ID } from '@/src/config';

type Phase = 'idle' | 'checking' | 'ready' | 'none' | 'dev' | 'placeholder' | 'error';

type UpdateContextValue = {
  phase: Phase;
  check: (manual?: boolean) => Promise<void>;
  reload: () => Promise<void>;
  dismiss: () => void;
  dismissed: boolean;
};

const UpdateContext = createContext<UpdateContextValue | null>(null);

function projectId(): string {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? '';
}

export function UpdateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [dismissed, setDismissed] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);

  const check = useCallback(async (manual = false) => {
    if (__DEV__ || !Updates.isEnabled) {
      setPhase('dev');
      return;
    }
    if (projectId() === PLACEHOLDER_EAS_PROJECT_ID) {
      setPhase('placeholder');
      return;
    }
    if (!manual && Date.now() - lastCheck < 30 * 60 * 1000) return;
    setLastCheck(Date.now());
    setPhase('checking');
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        setPhase('none');
        return;
      }
      await Updates.fetchUpdateAsync();
      setPhase('ready');
      setDismissed(false);
    } catch {
      setPhase('error');
    }
  }, [lastCheck]);

  useEffect(() => {
    void check(false);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void check(false);
    });
    return () => sub.remove();
  }, [check]);

  const value = useMemo<UpdateContextValue>(
    () => ({
      phase,
      check,
      reload: async () => {
        await Updates.reloadAsync();
      },
      dismiss: () => setDismissed(true),
      dismissed,
    }),
    [phase, check, dismissed],
  );

  return <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>;
}

export function useUpdates(): UpdateContextValue {
  const value = useContext(UpdateContext);
  if (!value) {
    return {
      phase: 'idle',
      check: async () => undefined,
      reload: async () => undefined,
      dismiss: () => undefined,
      dismissed: true,
    };
  }
  return value;
}
