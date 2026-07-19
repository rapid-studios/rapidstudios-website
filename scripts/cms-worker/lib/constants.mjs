export const WORKER_VERSION = "1.0.0";

export const PINNED_ORIGIN = "https://rapidstudios.dev";

export const CAPABILITIES = Object.freeze([
  "codex.content.v1",
  "codex.theme.v1",
  "git.publish.v1",
]);

// The server queue currently names the same capabilities by job kind.
export const QUEUE_CAPABILITIES = Object.freeze(["content", "theme", "publish"]);

export const DEFAULT_ENDPOINTS = Object.freeze({
  health: "/api/cms/worker/health",
  claim: "/api/cms/worker/claim",
  jobHeartbeat: "/api/cms/worker/heartbeat",
  complete: "/api/cms/worker/complete",
  fail: "/api/cms/worker/fail",
});

export const PUBLISH_TARGETS = Object.freeze({
  "rapidstudios-homepage-v1": "content/managed/rapidstudios-homepage.json",
});

export const GITHUB_REPOSITORY_URL =
  "https://github.com/rapid-studios/rapidstudios-website.git";
export const GITHUB_REPOSITORY = "rapid-studios/rapidstudios-website";
export const GITHUB_LOGIN = "chilooby";
export const GITHUB_BASE_BRANCH = "main";

export const SAFE_ENV_KEYS = Object.freeze([
  "ALLUSERSPROFILE",
  "APPDATA",
  "CODEX_HOME",
  "CommonProgramFiles",
  "CommonProgramFiles(x86)",
  "CommonProgramW6432",
  "COMPUTERNAME",
  "ComSpec",
  "COMSPEC",
  "HOMEDRIVE",
  "HOMEPATH",
  "LOCALAPPDATA",
  "NUMBER_OF_PROCESSORS",
  "OS",
  "Path",
  "PATH",
  "PATHEXT",
  "PROCESSOR_ARCHITECTURE",
  "PROCESSOR_IDENTIFIER",
  "ProgramData",
  "ProgramFiles",
  "ProgramFiles(x86)",
  "ProgramW6432",
  "PSModulePath",
  "PUBLIC",
  "SystemDrive",
  "SystemRoot",
  "TEMP",
  "TMP",
  "USERDOMAIN",
  "USERNAME",
  "USERPROFILE",
  "windir",
]);
