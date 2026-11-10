# App Review checklist

Walk this before `eas submit`. Justora is a timer and a short list. It does not treat, diagnose, or cure ADHD or any other condition.

## Guideline 1.4.1

- Store listing, screenshots, and in-app copy do not say the app treats, diagnoses, or cures anything.
- `APP_STORE.md` includes that sentence in every locale.
- Terms and the paywall repeat it.

## Guideline 4.3

Reviewers should see more than a generic timer, without an account:

- Shrinking disc, not only digits.
- Just Start (two minutes) and the option to continue.
- A three-to-five item today list with durations.
- Halfway and five-minute check-ins.
- Companion, optional rain or brown noise, and a haptic metronome that defaults off.
- Estimate trainer, routines, mood check-in, badges, weekly recap, streak card.
- Home Screen widget and Live Activity on a real iOS build (not Expo Go).

## Guideline 3.1.2

On the paywall, with a configured offering:

- Plan name (Justora Pro), length (1 month or 1 year), and the price string from StoreKit.
- Free-trial length only when the product’s intro price is free. Otherwise the paywall does not invent a trial.
- Auto-renewal sentence: charged to the Apple ID, renews unless cancelled at least 24 hours before the period ends, managed in App Store account settings.
- Terms of Use and Privacy Policy open inside the app.
- Restore purchases is on the paywall and in Settings.

Create `focus_pro_monthly` and `focus_pro_yearly` with a 7-day introductory offer and entitlement `pro` before review, or the purchase button stays disabled.

## Guideline 5.1

- Tasks, timers, moods, and settings stay in AsyncStorage on device.
- No account, no analytics SDK, no tracking, no ATT prompt.
- Purchases: Apple and RevenueCat see an anonymous app user id and the receipt.
- Expo Update, once the real project id is set, requests the project id, platform, and runtime version. Task content is not uploaded.
- `privacy/PrivacyInfo.xcprivacy` matches `ios.privacyManifests` in `app.config.ts`. Reasons cover UserDefaults (`CA92.1`), file timestamps (`C617.1`, `0A2A.1`, `3B52.1`), disk space (`E174.1`, `85F4.1`), and system boot time (`35F9.1`), which this dependency set uses. `NSPrivacyTracking` is false. Collected-data types in the manifest are empty. Answer the App Store nutrition form separately: purchases and an anonymous id if RevenueCat is live, and diagnostics only if you enable Expo Update.
- Permission is requested the first time a timer is running, after an in-app explanation, not at cold launch. `NSUserNotificationsUsageDescription` is localized in `languages/*.json`. iOS still shows its own system dialog. There is no microphone permission.
- The app works offline. Failed purchase, update, or notification calls leave the timer usable.
- Replace `hello@example.com` and host the privacy policy URL before submission.

## Binary

- `com.fishmaps.justora` matches the App Store Connect record, or you changed both.
- Icons: light, dark, and tinted 1024s, Android adaptive icon, notification glyph, splash.
- `ITSAppUsesNonExemptEncryption` is false.
- No placeholder screens. Dev-only Pro preview is compiled out of release (`__DEV__`).
- `EXPO_PUBLIC_ENABLE_APP_INTENTS` stays unset so a non-functional Siri intent is not advertised. URL shortcuts are documented only in the README.
