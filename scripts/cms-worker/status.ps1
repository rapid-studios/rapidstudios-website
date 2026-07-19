[CmdletBinding()]
param(
  [string]$ConfigPath = (Join-Path $env:LOCALAPPDATA "RapidStudios\cms-worker\config.json"),
  [switch]$Deep
)

$ErrorActionPreference = "Stop"
$TaskName = "RapidStudiosCmsWorker"
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
$taskInfo = if ($task) { Get-ScheduledTaskInfo -TaskName $TaskName } else { $null }
$configFull = [IO.Path]::GetFullPath($ConfigPath)
$configExists = Test-Path -LiteralPath $configFull -PathType Leaf
$config = if ($configExists) { Get-Content -Raw -LiteralPath $configFull | ConvertFrom-Json } else { $null }
$statusPath = Join-Path $env:LOCALAPPDATA "RapidStudios\cms-worker\status.json"
$localStatus = if (Test-Path -LiteralPath $statusPath -PathType Leaf) {
  try { Get-Content -Raw -LiteralPath $statusPath | ConvertFrom-Json } catch { $null }
} else { $null }

$codexOAuth = "Not checked"
$githubAccount = "Not checked"
if ($Deep -and $config) {
  if (Test-Path -LiteralPath ([string]$config.codexExecutable) -PathType Leaf) {
    $codexResult = & ([string]$config.codexExecutable) login status 2>&1 | Out-String
    $codexOAuth = if ($codexResult -match "Logged in using ChatGPT") { "Ready (ChatGPT OAuth)" } else { "Not ready" }
  } else {
    $codexOAuth = "Codex executable missing"
  }
  if (Test-Path -LiteralPath ([string]$config.publish.githubCliExecutable) -PathType Leaf) {
    $login = & ([string]$config.publish.githubCliExecutable) api user --jq .login 2>$null | Out-String
    $githubAccount = if ($LASTEXITCODE -eq 0) { $login.Trim() } else { "Not authenticated" }
  } else {
    $githubAccount = "GitHub CLI executable missing"
  }
}

[PSCustomObject]@{
  TaskInstalled = [bool]$task
  TaskState = if ($task) { [string]$task.State } else { "Not installed" }
  LastRunTime = if ($taskInfo) { $taskInfo.LastRunTime } else { $null }
  LastTaskResult = if ($taskInfo) { $taskInfo.LastTaskResult } else { $null }
  NextRunTime = if ($taskInfo) { $taskInfo.NextRunTime } else { $null }
  ConfigPresent = $configExists
  SecretPresent = [bool]($config -and (Test-Path -LiteralPath ([string]$config.secretFile) -PathType Leaf))
  WorkerState = if ($localStatus) { $localStatus.state } else { "No local status" }
  CurrentJobId = if ($localStatus) { $localStatus.currentJobId } else { $null }
  LastStatusUpdate = if ($localStatus) { $localStatus.updatedAt } else { $null }
  CodexOAuth = $codexOAuth
  GitHubAccount = $githubAccount
}
