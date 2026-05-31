# TaskQuest

ギルド世界観のゲーミファイドタスク管理アプリ。クエストをこなしてキャラクターを育てよう。

## 起動方法

**ターミナルを2つ開いて実行する。**

### 1. Metro bundler を起動（ターミナル1）

```sh
npm start
```

### 2. Android にビルド＆インストール（ターミナル2）

```sh
npm run android
```

Metro が起動済みの場合は `a` キーを押しても Android 向けにビルドできる。

> **前提条件**: Android Studio・Android SDK・エミュレーターまたは実機が必要。
> 詳細: [React Native 環境構築](https://reactnative.dev/docs/set-up-your-environment)

---

## 終了方法

| 対象 | 操作 |
|---|---|
| Metro bundler | ターミナルで `Ctrl + C` |
| Android エミュレーター | Android Studio の AVD Manager から停止、または `×` で閉じる |
| 実機アプリ | ホームボタンで戻るだけでOK（次回 `npm run android` で再インストール） |

`npm run android` を実行すると Gradle デーモンがバックグラウンドで残り続ける。不要な場合は以下の手順で停止する。

**Step 1: プロジェクトの Gradle デーモンを止める**

```sh
cd android && ./gradlew --stop
```

**Step 2: 残存デーモンを確認する**

```sh
jps -l
```

`GradleDaemon` が表示されていれば残っている。

**Step 3: 残っている場合は PowerShell で一括終了**

```powershell
Get-WmiObject Win32_Process |
  Where-Object { $_.Name -like "*java*" -and $_.CommandLine -like "*GradleDaemon*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

> VSCode の Java 拡張（Language Server など）は `GradleDaemon` を含まないため、上記コマンドでは終了されない。

---

## Android APK ビルド（リリース用）

### 前提条件（初回のみ・Windows）

Windows の MAX_PATH 制限（260文字）により、そのままではビルドが失敗する。以下を一度だけ設定する。

**1. Windows Long Path 有効化（管理者 PowerShell で実行）**

```powershell
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -Value 1
```

**2. Git の長いパス対応を有効化**

```powershell
git config --global core.longpaths true
```

**3. ninja を新しいバージョンに差し替え**

Android SDK に同梱の ninja 1.10.2 は Long Path 非対応のため、1.11 以降への差し替えが必要。

```powershell
# winget で最新 ninja をインストール
winget install Ninja-build.Ninja

# ターミナルを再起動後、SDK の ninja を差し替え
Copy-Item (Get-Command ninja).Source `
  "$env:LOCALAPPDATA\Android\Sdk\cmake\3.22.1\bin\ninja.exe" -Force
```

### APK ビルド手順

```powershell
cd android
.\gradlew assembleRelease
```

出力先：`android/app/build/outputs/apk/release/app-release.apk`

### 端末へのインストール

USB 接続 + USB デバッグ有効の状態で：

```powershell
adb install android\app\build\outputs\apk\release\app-release.apk
```

### キャッシュクリア（ビルドが壊れた場合）

```powershell
# cmake キャッシュを削除
Remove-Item -Recurse -Force "\\?\$PWD\android\app\.cxx" -ErrorAction SilentlyContinue

# Gradle キャッシュを削除
cd android && .\gradlew clean
```

---

## 開発中によく使うコマンド

```sh
# TypeScript 型チェック
npx tsc --noEmit

# Lint
npm run lint

# テスト
npm test
```

## 使用フォント

### ベストテンFONT（BestTen-DOT）

| 項目 | 内容 |
|---|---|
| フォント名 | ベストテンFONT（BestTen-DOT / BestTen-CRT） |
| 制作者 | Flop Design（フロップデザイン） |
| 配布元 | https://www.flopdesign.com/ |
| ダウンロード | https://booth.pm/ja/items/2747965 （無料） |

#### ライセンス

ベストテンFONT は **M+ FONTS PROJECT License** のもとで配布されています。

> These fonts are free software.  
> Unlimited permission is granted to use, copy, and distribute them, with  
> or without modification, either commercially or noncommercially.  
> THESE FONTS ARE PROVIDED "AS IS" WITHOUT WARRANTY.  
>
> Copyright (C) 2002-2021 M+ FONTS PROJECT  
> Copyright (C) 2021 FLOP DESIGN

フォントファイルの詳細なライセンスは [`Best10-FONT/mplus_bitmap_fonts/LICENSE_E`](Best10-FONT/mplus_bitmap_fonts/LICENSE_E) を参照してください。

#### クレジット表記

```
使用フォント：ベストテンFONT by Flop Design
https://www.flopdesign.com/
```

#### プロジェクトへの組み込み方法

フォントファイルは以下に配置済みです（再設定不要）：

```
src/assets/fonts/          ← ソース管理用
android/app/src/main/assets/fonts/  ← Android ビルド用
```

フォントのリンク設定は `react-native.config.js` で管理しています。  
フォントを追加・変更する場合は以下を実行してください：

```sh
npx @react-native-community/cli link
```

---

## 画面構成

| タブ | 内容 |
|---|---|
| ホーム | ギルドホーム。キャラステータスとクエスト状況を表示 |
| 掲示板 | クエストの発注・受注 |
| 進行中 | 受注済みクエストの完了報告・放棄 |
| キャラ | キャラクター情報とアイテム装備・売却 |
| ガチャ | 装備アイテムのガチャ（1日制限あり・Gold消費） |
