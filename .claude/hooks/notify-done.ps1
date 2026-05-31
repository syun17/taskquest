$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null

if ($currentBranch -like "feature/auto-*") {
    $status = git status --porcelain 2>$null
    if ($status) {
        $changed = @(git diff --name-only 2>$null) + @(git diff --name-only --cached 2>$null) |
            Select-Object -Unique | Select-Object -First 3
        $fileList = $changed -join ", "
        git add -A
        git commit -m "auto: $fileList"
    }

    git checkout develop 2>$null
    $mergeResult = git merge $currentBranch --no-edit 2>&1
    $mergeSuccess = $LASTEXITCODE -eq 0

    Add-Type -AssemblyName System.Windows.Forms
    $notify = New-Object System.Windows.Forms.NotifyIcon
    $notify.Icon = [System.Drawing.SystemIcons]::Information
    $notify.BalloonTipTitle = "TaskQuest - Claude Code"
    if ($mergeSuccess) {
        $notify.BalloonTipText = "[$currentBranch] developにマージ完了！確認してください。"
    } else {
        $notify.BalloonTipText = "[$currentBranch] マージ失敗。競合を確認してください。"
        $notify.Icon = [System.Drawing.SystemIcons]::Warning
    }
    $notify.Visible = $true
    $notify.ShowBalloonTip(10000)
    Start-Sleep -Seconds 1
    $notify.Dispose()
}
