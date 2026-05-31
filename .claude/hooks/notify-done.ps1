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

    Add-Type -AssemblyName System.Windows.Forms
    $notify = New-Object System.Windows.Forms.NotifyIcon
    $notify.Icon = [System.Drawing.SystemIcons]::Information
    $notify.BalloonTipTitle = "TaskQuest - Claude Code"
    $notify.BalloonTipText = "[$currentBranch] 修正・コミット完了！確認してください。"
    $notify.Visible = $true
    $notify.ShowBalloonTip(10000)
    Start-Sleep -Seconds 1
    $notify.Dispose()
}
