# グローバル .claude 適用手順

## 適用状況の確認（Windows / PowerShell）

```powershell
Get-Content $env:USERPROFILE\.claude\CLAUDE.md -TotalCount 3
```

「# グローバル設定」で始まれば適用済み。ファイルがない・内容が違う場合は以下で適用する:

```powershell
Copy-Item _global-claude\CLAUDE.md $env:USERPROFILE\.claude\CLAUDE.md -Force
```

## 適用状況の確認（Mac / Linux）

```bash
head -n 3 ~/.claude/CLAUDE.md
```

「# グローバル設定」で始まれば適用済み。ファイルがない・内容が違う場合は以下で適用する:

```bash
cp -f _global-claude/CLAUDE.md ~/.claude/CLAUDE.md
```

## 設計方針

- グローバルには「個人の応答スタイル」と「全プロジェクト共通の安全最低ライン」だけを置く
- 技術スタック・品質ゲート・ワークフロー・フックはすべてプロジェクト側（`.claude/`）で管理する
- グローバルの `settings.json` には手を入れない（Cowork のスケジュールタスク等の管理領域があるため）
