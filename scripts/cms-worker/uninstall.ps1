[CmdletBinding(SupportsShouldProcess)]
param()

$ErrorActionPreference = "Stop"
$TaskName = "RapidStudiosCmsWorker"
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()

if ($env:OS -ne "Windows_NT") {
  throw "The Rapid Studios local worker uninstaller only supports Windows."
}
if ($identity.Name.Split("\")[-1] -ne "Jaxon") {
  throw "Uninstall this task while signed in as the Windows user Jaxon."
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $task) {
  Write-Host "$TaskName is not installed."
  return
}

if ($PSCmdlet.ShouldProcess($TaskName, "Stop and unregister the scheduled task")) {
  Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Write-Host "Uninstalled $TaskName."
Write-Host "The local config, secret, and status files were intentionally retained for recovery."
