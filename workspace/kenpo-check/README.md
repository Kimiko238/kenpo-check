# Kenpo Check

協会けんぽの健診対象年齢を確認する Next.js アプリです。

## Development

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

通常の開発モードでは `/api/rule-config` を使い、マスタ画面から `data/kenpo-rule-config.json` へ設定を保存できます。

## Build Modes

このプロジェクトには2種類のビルドがあります。

### 通常ビルド

```bash
npm run build
```

API ありの通常 Next.js ビルドです。

- `/api/rule-config` を使います
- マスタ画面で保存できます
- `data/kenpo-rule-config.json` があれば優先して読みます
- なければ `DEFAULT_RULE_CONFIG` を使います

### Firebase Hosting 用の静的ビルド

```bash
npm run build:static
```

Firebase Hosting の無料枠で公開しやすい静的出力用ビルドです。

- `out/` に静的ファイルを出力します
- `/api/rule-config` は含まれません
- マスタ保存・リセットは無効になります
- 判定には `DEFAULT_RULE_CONFIG` を使います
- マスタを変える場合はコード側の標準設定を変更して再ビルドします

## Firebase Hosting Deploy

静的公開する場合は、先に静的ビルドを実行します。

```bash
npm run build:static
firebase deploy --only hosting
```

`firebase.json` の公開先は `out` です。

```json
{
  "hosting": {
    "public": "out"
  }
}
```

## Config Notes

標準マスタは [src/app/lib/kenpo-rules.ts](src/app/lib/kenpo-rules.ts) の `DEFAULT_RULE_CONFIG` にあります。

通常開発モードでマスタ画面から保存すると、設定は次のファイルに保存されます。

```text
data/kenpo-rule-config.json
```

静的公開モードでは、この保存ファイルは使わず、`DEFAULT_RULE_CONFIG` が使われます。
