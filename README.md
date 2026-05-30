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

## 画面構成

| タブ | 内容 |
|---|---|
| ホーム | ギルドホーム。キャラステータスとクエスト状況を表示 |
| 掲示板 | クエストの発注・受注 |
| 進行中 | 受注済みクエストの完了報告・放棄 |
| キャラ | キャラクター情報とアイテム装備・売却 |
| ガチャ | 装備アイテムのガチャ（1日制限あり・Gold消費） |
