import type { ExpoConfig } from 'expo/config';

const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME ?? 'Justora';
const PLACEHOLDER_EAS_PROJECT_ID = '4c2cc818-a80b-4f5f-b88a-2ef69d8ac75b';
const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || PLACEHOLDER_EAS_PROJECT_ID;

const locales = ['en', 'tr', 'de', 'es', 'fr', 'pt-BR', 'it', 'ja'] as const;

const config: ExpoConfig = {
  name: APP_NAME,
  slug: 'justora',
  owner: 'fishmaps',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'justora',
  userInterfaceStyle: 'automatic',
  locales: Object.fromEntries(locales.map((code) => [code, `./languages/${code}.json`])),
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fishmaps.justora',
    buildNumber: '1',
    icon: {
      light: './assets/images/icon-light.png',
      dark: './assets/images/icon-dark.png',
      tinted: './assets/images/icon-tinted.png',
    },
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      NSUserNotificationsUsageDescription:
        'Justora sends a gentle notice when a focus session ends, for optional halfway check-ins, and for reminders you turn on.',
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1', '0A2A.1', '3B52.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
          NSPrivacyAccessedAPITypeReasons: ['E174.1', '85F4.1'],
        },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
      ],
    },
  },
  android: {
    package: 'com.fishmaps.justora',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
      backgroundColor: '#FFE0C4',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: `https://u.expo.dev/${projectId}`,
    checkAutomatically: 'NEVER',
  },
  extra: {
    eas: { projectId },
    contactEmail: process.env.EXPO_PUBLIC_CONTACT_EMAIL || 'hello@example.com',
    privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL || '',
    termsUrl: process.env.EXPO_PUBLIC_TERMS_URL || '',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#F6F1EA',
        imageWidth: 220,
        dark: {
          image: './assets/images/splash-icon-dark.png',
          backgroundColor: '#1C1714',
        },
      },
    ],
    [
      'expo-localization',
      {
        supportedLocales: {
          ios: [...locales],
          android: [...locales],
        },
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: false,
        recordAudioAndroid: false,
        enableBackgroundRecording: false,
        enableBackgroundPlayback: true,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#E7A08A',
        enableRemoteNotifications: false,
      },
    ],
    'expo-sharing',
    [
      'expo-widgets',
      {
        widgets: [
          {
            name: 'FocusWidget',
            displayName: 'Justora',
            description: 'See a focus timer that is running.',
            ios: {
              supportedFamilies: ['systemSmall', 'systemMedium', 'accessoryRectangular'],
              initialLayout: './widgets/FocusWidget.tsx',
            },
            android: null,
          },
        ],
      },
    ],
  ],
  experiments: { typedRoutes: true },
};

export default config;
