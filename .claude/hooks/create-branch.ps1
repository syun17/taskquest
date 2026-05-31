$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null

if ($currentBranch -eq "develop") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $newBranch = "feature/auto-$timestamp"
    git checkout -b $newBranch
    Write-Output "ブランチ '$newBranch' を作成しました"
}
