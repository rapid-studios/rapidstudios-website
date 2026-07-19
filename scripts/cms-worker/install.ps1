[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory = $true)]
  [string]$ConfigPath,

  [Parameter(Mandatory = $true)]
  [string]$NodeExecutable,

  [switch]$Force,
  [switch]$StartNow
)

$ErrorActionPreference = "Stop"
$TaskName = "RapidStudiosCmsWorker"
$ExpectedUser = "Jaxon"

if ($env:OS -ne "Windows_NT") {
  throw "The Rapid Studios local worker installer only supports Windows."
}

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$userLeaf = $identity.Name.Split("\")[-1]
if ($userLeaf -ne $ExpectedUser) {
  throw "Install this task while signed in as the Windows user Jaxon. SYSTEM and service accounts are not supported."
}

$localRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA "RapidStudios\cms-worker"))
$configFull = [IO.Path]::GetFullPath($ConfigPath)
$nodeFull = [IO.Path]::GetFullPath($NodeExecutable)
if (-not $configFull.StartsWith($localRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "ConfigPath must be inside $localRoot."
}
if (-not (Test-Path -LiteralPath $configFull -PathType Leaf)) {
  throw "Config file not found. Copy config.example.json to the local worker directory and fill in executable paths first."
}
if (-not (Test-Path -LiteralPath $nodeFull -PathType Leaf) -or [IO.Path]::GetFileName($nodeFull) -ne "node.exe") {
  throw "NodeExecutable must be an absolute path to node.exe."
}
$nodeVersion = & $nodeFull --version
if ($LASTEXITCODE -ne 0) {
  throw "NodeExecutable did not report a valid version."
}
$nodeVersionText = [string]$nodeVersion
if ($nodeVersionText -notmatch '^v(\d+)\.') { throw "NodeExecutable did not report a valid version." }
if ([int]$Matches[1] -lt 22) {
  throw "The CMS worker requires Node.js 22 or newer."
}

$config = Get-Content -Raw -LiteralPath $configFull | ConvertFrom-Json
$requiredExecutables = @(
  [string]$config.codexExecutable,
  [string]$config.publish.gitExecutable,
  [string]$config.publish.githubCliExecutable,
  [string]$config.publish.npmExecutable
)
foreach ($executable in $requiredExecutables) {
  if (-not [IO.Path]::IsPathFullyQualified($executable) -or -not (Test-Path -LiteralPath $executable -PathType Leaf)) {
    throw "Every executable path in config.json must be absolute and point to an existing file."
  }
}
$secretFull = [IO.Path]::GetFullPath([string]$config.secretFile)
if (-not $secretFull.StartsWith($localRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "The configured secretFile must be inside $localRoot."
}
if (-not (Test-Path -LiteralPath $secretFull -PathType Leaf)) {
  throw "The configured secret file does not exist. It must contain the same CMS_WORKER_KEY value configured in Vercel."
}
$secretLength = [Text.Encoding]::UTF8.GetByteCount((Get-Content -Raw -LiteralPath $secretFull).Trim())
if ($secretLength -lt 32 -or $secretLength -gt 512) {
  throw "The worker signing secret must contain 32-512 UTF-8 bytes."
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing -and -not $Force) {
  throw "The $TaskName task already exists. Re-run with -Force only when you intend to replace its definition."
}

$installDir = Join-Path $localRoot "app"
$workerEntry = Join-Path $installDir "worker.mjs"
if ($PSCmdlet.ShouldProcess($installDir, "Copy the versioned CMS worker files")) {
  New-Item -ItemType Directory -Path $installDir -Force | Out-Null
  if ([IO.Path]::GetFullPath($PSScriptRoot) -ne [IO.Path]::GetFullPath($installDir)) {
    Get-ChildItem -LiteralPath $PSScriptRoot -Force | ForEach-Object {
      Copy-Item -LiteralPath $_.FullName -Destination $installDir -Recurse -Force
    }
  }
}

function Set-PrivateAcl([string]$LiteralPath) {
  $userSid = $identity.User.Value
  & "$env:SystemRoot\System32\icacls.exe" $LiteralPath "/inheritance:r" "/grant:r" "*$($userSid):(M)" "*S-1-5-18:(R)" "*S-1-5-32-544:(R)" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not restrict ACLs for a local worker credential file." }
}

if ($PSCmdlet.ShouldProcess($configFull, "Restrict config and secret ACLs to Jaxon, SYSTEM, and Administrators")) {
  Set-PrivateAcl $configFull
  Set-PrivateAcl $secretFull
}

$arguments = '"{0}" --config "{1}"' -f $workerEntry, $configFull
$action = New-ScheduledTaskAction -Execute $nodeFull -Argument $arguments -WorkingDirectory $installDir
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $identity.Name
$principal = New-ScheduledTaskPrincipal -UserId $identity.Name -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -RestartCount 5 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -MultipleInstances IgnoreNew `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -WakeToRun

if ($PSCmdlet.ShouldProcess($TaskName, "Register a current-user task at Jaxon logon")) {
  Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Outbound-only Rapid Studios CMS worker using Jaxon's local Codex ChatGPT OAuth." `
    -Force | Out-Null

  if ($StartNow) {
    Start-ScheduledTask -TaskName $TaskName
  }
}

Write-Host "Installed $TaskName for $($identity.Name)."
if (-not $StartNow) {
  Write-Host "The task will start at the next logon. Use Start-ScheduledTask -TaskName $TaskName to start it now."
}
