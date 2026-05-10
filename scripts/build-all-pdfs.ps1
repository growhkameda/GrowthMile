<#
.SYNOPSIS
    docs/ 配下の主要設計書を一括PDF化するスクリプト

.DESCRIPTION
    プロジェクトの設計書を一括でPDFに変換します。
    個別変換は build-pdf.ps1 を使用してください。

.EXAMPLE
    .\scripts\build-all-pdfs.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$buildPdf = Join-Path $scriptDir "build-pdf.ps1"

# 変換対象の設計書一覧
$docs = @(
    "docs/requirements.md",
    "docs/spec-api.md",
    "docs/spec-db.md",
    "docs/security.md",
    "docs/database_design.md",
    "docs/frontend_structure.md",
    "docs/backend_structure.md",
    "docs/features/requirements.md"
)

Write-Host ""
Write-Host "========================================"
Write-Host "  PreZen 設計書 一括PDF変換"
Write-Host "========================================"
Write-Host ""

$successCount = 0
$skipCount = 0
$failCount = 0

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "--- $doc ---"
        try {
            & $buildPdf -InputFile $doc
            $successCount++
        } catch {
            Write-Warning "  失敗: $_"
            $failCount++
        }
        Write-Host ""
    } else {
        Write-Host "[SKIP] $doc (ファイルが見つかりません)"
        $skipCount++
    }
}

Write-Host "========================================"
Write-Host "  結果: 成功=$successCount スキップ=$skipCount 失敗=$failCount"
Write-Host "  出力先: docs/pdf/"
Write-Host "========================================"

# 生成されたPDF一覧を表示
if (Test-Path "docs/pdf") {
    Write-Host ""
    Write-Host "生成されたPDF:"
    Get-ChildItem "docs/pdf" -Filter "*.pdf" | ForEach-Object {
        Write-Host "  $($_.Name) ($([math]::Round($_.Length / 1KB, 1)) KB)"
    }
}
