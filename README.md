# FinTrack

A React and TypeScript expense tracker for browsers and the Capacitor Android app.

## Run locally

Use Node.js 22.12+ (verified with Node 24):

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. No Supabase account, email, username, or environment variables are needed for the core app. Create a password of at least 8 characters on first launch, then enter only that password on later launches. Settings → Lock App locks the current session.

## Your data

Transactions, wallets, profile, notifications and preferences are saved in localStorage in the current browser/app. Unlocking never changes the data namespace. Existing data under the last signed-in profile is retained when upgrading; if there is no signed-in profile, the existing guest namespace is used. Other legacy profiles are left untouched.

Use Settings → Download full backup to save a JSON copy. Restore backup validates the file before replacing device data and requires confirmation. Backups do not include your password. CSV export is also available.

Data is specific to the browser origin or Android installation. Clearing browser/app data, uninstalling, using a different browser, or changing the site's origin does not transfer data. Keep a downloaded backup. This is a local app lock, not encryption or a cloud account; passwords are stored as salted PBKDF2-SHA256 verifiers. Password recovery uses a saved recovery code, with no email required. Save the code shown at setup. Existing installations can generate one in Settings → Password & recovery after entering the current password. Settings also supports changing a password. Recovery resets rotate the code and preserve financial data. The first upgrade from legacy accounts asks you to create the new local password.

## Web build

```sh
npm run build
npm run preview
```

Deploy the generated `dist` folder to a static web host over HTTPS. The app uses Web Crypto, so HTTPS or localhost is required. Desktop and mobile browsers share the same responsive app. This change does not include a service worker or offline installation of the website; the Android bundle includes its assets locally.

## Android

```sh
npm run build
npx cap sync android
npx cap open android
```

Build and run with Android Studio. Android hardware behavior has not been verified in this workspace.

## Checks

```sh
npm run lint
npm run build
npm test
```

Browser tests use Microsoft Edge; install it before running. Tests cover password rejection, saving decimal transactions across reloads, preserving existing local profiles, deleting transactions with wallet reversal, backup export/restore, invalid backup rejection, and mobile viewport bounds. Screenshots are written to `test-results`.

The legacy optional AI assistant code remains in the source and uses an external service; the main navigation focuses on local tracking, wallets, analytics, and settings.

### Signed Android release

The project uses version 1.2.0 (Android version code 3). Run
`scripts/build-android-release.ps1 -JavaHome <JDK21_PATH>` from PowerShell.
The script builds the web app, syncs Capacitor, and creates
`release/FinTrack-1.2.0-release.apk`.

Release signing reads the ignored `android/keystore.properties` file:

```properties
storeFile=../release/fintrack-release.jks
storePassword=YOUR_PRIVATE_PASSWORD
keyAlias=fintrack
keyPassword=YOUR_PRIVATE_PASSWORD
```

Keep the keystore and its password file private and backed up. This workspace
created a new release key; an older installation signed with another key
cannot accept it as an in-place update. Back up existing data before uninstalling.
Only share the APK. Do not distribute the whole release directory.

## GitHub updates

Settings → App updates checks the latest stable public GitHub release, compares its
version with the installed app, and offers the APK download. Android opens release
links in the system browser. Downloading an update does not uninstall the app;
Android still requires the user to confirm installing the downloaded APK. Always
use the same package ID and signing key, and increment Android versionCode.

Stable download link: https://github.com/malikmajid161/expense-tracker-app/releases/latest/download/FinTrack-App.apk

Releases are built and uploaded manually with the existing signing key. This is
an update download flow, not silent installation or automatic release publishing.
