import { Platform } from 'react-native';

export type NotifyPlan = {
  granted: boolean;
  sound: boolean;
  checkIns: boolean;
  timer: {
    status: 'running' | 'paused';
    endsAt: number | null;
    durationMs: number;
    accumulatedMs: number;
  } | null;
  planReminder: boolean;
  planHour: number;
  planMinute: number;
  streakReminder: boolean;
  copy: {
    endTitle: string;
    endBody: string;
    halfTitle: string;
    halfBody: string;
    fiveTitle: string;
    fiveBody: string;
    planTitle: string;
    planBody: string;
    streakTitle: string;
    streakBody: string;
    nudgeTitle: string;
    nudgeBodies: string[];
  };
  nudgeOn: boolean;
  nudgeHour: number;
  nudgeMinute: number;
  startedToday: boolean;
};

let generation = 0;
let handlerReady = false;

export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'web' || handlerReady) return;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerReady = true;
  } catch {
    handlerReady = false;
  }
}

export async function notificationPermission(): Promise<'granted' | 'denied' | 'undetermined' | 'unavailable'> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const Notifications = await import('expo-notifications');
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (current.status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const Notifications = await import('expo-notifications');
    const result = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return result.granted;
  } catch {
    return false;
  }
}

async function schedule(
  Notifications: typeof import('expo-notifications'),
  date: Date,
  title: string,
  body: string,
  sound: boolean,
): Promise<void> {
  if (date.getTime() < Date.now() + 1500) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: sound ? 'default' : undefined },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export async function syncNotifications(plan: NotifyPlan): Promise<void> {
  if (Platform.OS === 'web') return;
  const gen = ++generation;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (gen !== generation || !plan.granted) return;

    const timer = plan.timer;
    if (timer?.status === 'running' && timer.endsAt) {
      await schedule(Notifications, new Date(timer.endsAt), plan.copy.endTitle, plan.copy.endBody, plan.sound);
      if (plan.checkIns) {
        const remaining = timer.endsAt - Date.now();
        const elapsed = timer.durationMs - remaining;
        const halfAt = Date.now() + (timer.durationMs / 2 - elapsed);
        if (timer.durationMs >= 4 * 60_000 && halfAt > Date.now() + 1500 && timer.endsAt - halfAt > 1500) {
          await schedule(Notifications, new Date(halfAt), plan.copy.halfTitle, plan.copy.halfBody, false);
        }
        const fiveAt = timer.endsAt - 5 * 60_000;
        if (timer.durationMs >= 10 * 60_000 && fiveAt > Date.now() + 1500) {
          await schedule(Notifications, new Date(fiveAt), plan.copy.fiveTitle, plan.copy.fiveBody, false);
        }
      }
    }

    if (plan.planReminder) {
      await Notifications.scheduleNotificationAsync({
        content: { title: plan.copy.planTitle, body: plan.copy.planBody, sound: false },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: plan.planHour,
          minute: plan.planMinute,
        },
      });
    }

    if (plan.streakReminder) {
      await Notifications.scheduleNotificationAsync({
        content: { title: plan.copy.streakTitle, body: plan.copy.streakBody, sound: false },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
      });
    }

    if (plan.nudgeOn && plan.copy.nudgeBodies.length > 0) {
      const now = new Date();
      for (let day = 0; day < 7; day += 1) {
        const when = new Date(now);
        when.setDate(now.getDate() + day);
        when.setHours(plan.nudgeHour, plan.nudgeMinute, 0, 0);
        if (when.getTime() < Date.now() + 1500) continue;
        if (day === 0 && plan.startedToday) continue;
        const body = plan.copy.nudgeBodies[(when.getDate() + day) % plan.copy.nudgeBodies.length] ?? plan.copy.nudgeBodies[0]!;
        await schedule(Notifications, when, plan.copy.nudgeTitle, body, false);
      }
    }
  } catch {
    // Missing permission or Expo Go. The timer still runs from timestamps.
  }
}
