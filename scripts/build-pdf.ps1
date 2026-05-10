<#
.SYNOPSIS
    設計書Markdown → PDF変換スクリプト（Docker + pandoc + Mermaid対応）

.DESCRIPTION
    Markdownファイルを顧客提出用PDFに変換します。
    - Mermaid図は事前にPNG化してからpandocに渡します
    - 日本語フォント（Noto Sans CJK JP）対応
    - 表紙・目次・ヘッダー/フッター（CONFIDENTIAL）付き

.PARAMETER InputFile
    変換するMarkdownファイルのパス

.PARAMETER OutputDir
    PDF出力先ディレクトリ（デフォルト: docs/pdf）

.EXAMPLE
    .\scripts\build-pdf.ps1 docs/spec-api.md
    .\scripts\build-pdf.ps1 docs/spec-db.md -OutputDir output/
#>

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$InputFile,

    [Parameter(Position = 1)]
    [string]$OutputDir = "docs/pdf"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── 前提チェック ─────────────────────────────────
if (!(Test-Path $InputFile)) {
    Write-Error "ファイルが見つかりません: $InputFile"
    exit 1
}

# Docker確認
$dockerAvailable = $null
try {
    $dockerAvailable = docker version --format '{{.Server.Version}}' 2>$null
} catch {}

if (!$dockerAvailable) {
    Write-Error "Dockerが起動していません。Docker Desktopを起動してください。"
    exit 1
}

# ─── 出力ディレクトリ作成 ─────────────────────────
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "[INFO] 出力ディレクトリ作成: $OutputDir"
}

# ─── ファイル名解決 ───────────────────────────────
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
$outputFile = Join-Path $OutputDir "$baseName.pdf"
$tempDir = Join-Path $env:TEMP "prezen-pdf-build"
$tempMd = Join-Path $tempDir "$baseName.md"

# 一時ディレクトリの作成・クリーン
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# ─── Step 1: Mermaid図をPNGに変換 ────────────────
Write-Host ""
Write-Host "=== Mermaid図の変換 ==="

# 元のMarkdownの内容を読み込み
$content = Get-Content -Path $InputFile -Raw -Encoding UTF8
$mermaidCount = 0

# Mermaidコードブロックを検出してPNGに変換
$pattern = '(?s)```mermaid\r?\n(.*?)```'
$content = [regex]::Replace($content, $pattern, {
    param($match)
    $mermaidCount++
    $mermaidCode = $match.Groups[1].Value
    $mermaidFile = Join-Path $tempDir "mermaid-$mermaidCount.mmd"
    $pngFile = Join-Path $tempDir "mermaid-$mermaidCount.png"

    # Mermaidソースを一時ファイルに書き出し
    $mermaidCode | Out-File -FilePath $mermaidFile -Encoding UTF8 -NoNewline

    Write-Host "  [Mermaid $mermaidCount] PNG変換中..."

    # mmdc (Mermaid CLI) でPNG生成 — Docker経由
    docker run --rm `
        -v "${tempDir}:/data" `
        -w /data `
        minlag/mermaid-cli:latest `
        -i "/data/mermaid-$mermaidCount.mmd" `
        -o "/data/mermaid-$mermaidCount.png" `
        -b white `
        -w 1200 2>$null

    if (Test-Path $pngFile) {
        Write-Host "  [Mermaid $mermaidCount] OK: $pngFile"
        # Markdownの画像参照に置換
        return "![図${mermaidCount}](mermaid-${mermaidCount}.png)"
    } else {
        Write-Warning "  [Mermaid $mermaidCount] PNG変換に失敗。元のコードブロックを保持します。"
        return $match.Value
    }
})

if ($mermaidCount -eq 0) {
    Write-Host "  Mermaid図はありません。スキップ。"
}

# 変換後のMarkdownを一時ファイルに保存
$content | Out-File -FilePath $tempMd -Encoding UTF8 -NoNewline

# 元のdocs/templates/latex/ をコピー
$latexDir = Join-Path (Get-Location) "docs/templates/latex"
if (Test-Path $latexDir) {
    Copy-Item -Path "$latexDir/*" -Destination $tempDir -Force
}

# ─── Step 2: pandocでPDF生成 ─────────────────────
Write-Host ""
Write-Host "=== PDF生成 ==="
Write-Host "  入力: $InputFile"
Write-Host "  出力: $outputFile"

# YAMLフロントマターからタイトルを取得（あれば）
$titleMatch = [regex]::Match($content, '(?m)^title:\s*"?(.+?)"?\s*$')
$titleArg = ""
if ($titleMatch.Success) {
    $titleArg = "-V title=`"$($titleMatch.Groups[1].Value)`""
}

# pandoc実行（Docker経由）
docker run --rm `
    -v "${tempDir}:/data" `
    -w /data `
    pandoc/extra:latest `
    "$baseName.md" `
    -o "$baseName.pdf" `
    --pdf-engine=xelatex `
    -V "CJKmainfont=Noto Sans CJK JP" `
    -V "mainfont=Noto Sans CJK JP" `
    -V "monofont=Noto Sans Mono CJK JP" `
    -V fontsize=10pt `
    -V "geometry:margin=25mm" `
    --toc `
    --toc-depth=3 `
    --highlight-style=tango `
    -H "defaults.yaml" 2>$null

# デフォルトYAMLをヘッダーとして使おうとした場合の代替: defaultsを直接使用
$tempPdf = Join-Path $tempDir "$baseName.pdf"
if (!(Test-Path $tempPdf)) {
    Write-Host "  [RETRY] defaults.yamlなしで再試行..."
    docker run --rm `
        -v "${tempDir}:/data" `
        -w /data `
        pandoc/extra:latest `
        "$baseName.md" `
        -o "$baseName.pdf" `
        --pdf-engine=xelatex `
        -V "CJKmainfont=Noto Sans CJK JP" `
        -V fontsize=10pt `
        -V "geometry:margin=25mm" `
        --toc `
        --toc-depth=3 `
        --highlight-style=tango
}

# ─── Step 3: 出力コピー ──────────────────────────
if (Test-Path $tempPdf) {
    Copy-Item -Path $tempPdf -Destination $outputFile -Force
    Write-Host ""
    Write-Host "=== 完了 ==="
    Write-Host "  PDF: $outputFile"
    Write-Host "  サイズ: $([math]::Round((Get-Item $outputFile).Length / 1KB, 1)) KB"
} else {
    Write-Error "PDF生成に失敗しました。Dockerログを確認してください。"
    exit 1
}

# ─── クリーンアップ ───────────────────────────────
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
