# Justora

Justora is an iOS-first focus timer and short daily planner. A disc shrinks as time passes, a companion sits with you, and the day stays small on purpose. It does not treat, diagnose, or give medical advice.

Owner setup is for Enes: Expo, an Apple Developer account, and a RevenueCat account. The app stores tasks, timers, moods, and settings on the device. There is no account and no Supabase.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go for the timer, list, themes, and copy. Purchases, home-screen widgets, Live Activities, and over-the-air updates need a development or App Store build. They do not run inside Expo Go.

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build -p ios --profile development
npx expo start --dev-client
```

`eas init` writes the real EAS project id. Put that id in `EXPO_PUBLIC_EAS_PROJECT_ID` (or let `eas init` update `app.config.ts`) so `updates.url` is `https://u.expo.dev/<project-id>`. The placeholder id is `00000000-0000-4000-8000-000000000000`.

## Name and bundle id

The display name defaults to **Justora**. Override it with `EXPO_PUBLIC_APP_NAME`. The iOS bundle id and Android package are `com.fishmaps.justora` in `app.config.ts`. Change both before you create the App Store record if you want a different id.

App Store title used in `APP_STORE.md`: **Justora: ADHD Timer & Planner**.

## RevenueCat

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` to the public iOS SDK key (`appl_…`). Never put the secret key in the app.
3. In RevenueCat, create an entitlement named `pro`.
4. Create auto-renewable products `focus_pro_monthly` and `focus_pro_yearly`, each with a 7-day free introductory offer.
5. Attach both products to the current offering (packages `$rc_monthly` and `$rc_annual` are fine; the app also matches the product ids).
6. In App Store Connect, create the same product ids, set prices, and turn on the 7-day free trial. The trial lives on the product, not in this repo.

Without a real key the app still launches. The paywall explains that purchases are off and the free tier stays available.

Free: the 25-minute preset, Just Start (2 minutes), three tasks on today, one theme, the companion, check-ins, and headline stats.

Pro: the other presets, custom lengths, a longer today list, session history, the full estimate comparison, and extra themes.

## Checks

```bash
npx tsc --noEmit
npx expo export --platform ios
```

## Build and submit

```bash
npx eas-cli@latest build -p ios --profile production
npx eas-cli@latest submit -p ios --profile production
```

`eas.json` maps channels to profiles: `development`, `preview`, and `production`. `runtimeVersion` uses the `appVersion` policy, so an update reaches builds with the same `expo.version`. Bump `version` in `app.config.ts` when you change native code, permissions, or plugins, then ship a new binary.

Preview builds:

```bash
npx eas-cli@latest build -p ios --profile preview
npx eas-cli@latest update --channel preview --message "Copy pass" --environment preview
```

Production JS update, after a production binary is on a device:

```bash
npx eas-cli@latest update --channel production --message "Softer paywall copy" --environment production
```

SDK 55 and later require `--environment` on `eas update`.

### What an update can ship

JavaScript, images, sounds, and copy can go out with `eas update` when the runtime version matches.

A new native module, a permission, an icon, a widget or Live Activity layout change, or an Expo SDK upgrade needs a new `eas build`. The home-screen widget and Live Activity UI are compiled into the iOS extension. The app can push new timer props into them at runtime. Changing their layout needs a new build.

Do not use an update to change what Justora is. Apple expects downloaded code to keep the app’s reviewed purpose. Bug fixes, copy, and small behavior tweaks are in bounds. Turning Justora into a different product, adding medical claims, or sneaking in a native capability is not. The in-app update check never reloads while a timer is running. The person taps Reload.

## Widgets and Live Activities

`expo-widgets` (SDK 58) draws a Home Screen widget and a Live Activity / Dynamic Island from `widgets/FocusWidget.tsx` and `widgets/FocusActivity.tsx`. The widget schedules a minute-by-minute timeline, so the Home Screen keeps counting after the app is suspended. The Live Activity shows the current minute and refreshes while the app process is alive. A scheduled local notification still fires at the end if the phone has suspended the app.

Add the Justora widget from the iOS widget gallery after installing a dev or App Store build.

## Shortcuts

A Shortcuts action can open `justora://timer?just=1` or `justora://timer?minutes=25`. Native App Intents are behind `EXPO_PUBLIC_ENABLE_APP_INTENTS` and are not registered in this build.

## Languages

UI, notifications, and the paywall (including the renewal disclosure) ship in English, Turkish, German, Spanish, French, Brazilian Portuguese, Italian, and Japanese. The device language is used unless Settings picks one. `pt` and `pt-BR` both use Brazilian Portuguese.

To add a locale:

1. Copy `src/i18n/locales/de.ts`, translate every key, and `export const xx = { ... } satisfies Record<Key, string>`.
2. Register it in `src/i18n/index.ts` (`messages` and `localeChoices`) and add the code to `AppLocale` in `src/domain/types.ts`.
3. Add `languages/xx.json` with `ios.CFBundleDisplayName` and `ios.NSUserNotificationsUsageDescription`, and add the code to the `locales` array in `app.config.ts`.
4. Add a listing section to `APP_STORE.md`.

Info.plist strings are localized through Expo’s `locales` field. iOS does not show a custom sentence in the system notification prompt. The in-app explanation (shown the first time a timer is running, never at cold launch) is what people read. The plist string is still localized for the permission key.

## Before App Store review

- Host `PRIVACY.md` and put the URL in App Store Connect and `EXPO_PUBLIC_PRIVACY_URL`.
- Replace `hello@example.com`.
- Create the App Store Connect app, screenshots, and the subscription products with the 7-day trial.
- Paste `APP_REVIEW_NOTES.md` into App Review Information.
- Walk `REVIEW_CHECKLIST.md`.

Icons: `assets/images/icon-light.png`, `icon-dark.png`, `icon-tinted.png`, the Android adaptive layers, `notification-icon.png`, and `assets/ios/AppIcon.appiconset`. Expo generates the full size set at prebuild from the 1024 images.
