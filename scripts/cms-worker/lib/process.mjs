import { spawn } from "node:child_process";
import { WorkerError } from "./errors.mjs";
import { SAFE_ENV_KEYS } from "./constants.mjs";

export function sanitizedChildEnv(extra = {}) {
  const env = {};
  for (const key of SAFE_ENV_KEYS) {
    if (typeof process.env[key] === "string") env[key] = process.env[key];
  }
  // Explicitly supplied values are local, non-secret process settings only.
  for (const [key, value] of Object.entries(extra)) {
    if (typeof value === "string") env[key] = value;
  }
  return env;
}

export async function runProcess(executable, args, options = {}) {
  const {
    cwd,
    env = sanitizedChildEnv(),
    input = null,
    signal,
    timeoutMs = 10 * 60_000,
    maxOutputBytes = 2 * 1024 * 1024,
    failureCode = "process_failed",
  } = options;

  return await new Promise((resolve, reject) => {
    let settled = false;
    let outputBytes = 0;
    const stdout = [];
    const stderr = [];

    const child = spawn(executable, args, {
      cwd,
      env,
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      fn(value);
    };

    const stop = () => {
      if (child.exitCode !== null || child.killed) return;
      if (process.platform === "win32") {
        const taskkill = `${process.env.SystemRoot || "C:\\Windows"}\\System32\\taskkill.exe`;
        const killer = spawn(taskkill, ["/PID", String(child.pid), "/T", "/F"], {
          shell: false,
          windowsHide: true,
          stdio: "ignore",
        });
        killer.unref();
      } else {
        child.kill("SIGTERM");
      }
    };

    const onAbort = () => {
      stop();
      finish(
        reject,
        new WorkerError("aborted", "The child process was cancelled.", {
          retryable: false,
        }),
      );
    };

    const timer = setTimeout(() => {
      stop();
      finish(
        reject,
        new WorkerError(failureCode, "The child process exceeded its time limit.", {
          retryable: true,
        }),
      );
    }, timeoutMs);
    timer.unref?.();

    if (signal?.aborted) return onAbort();
    signal?.addEventListener("abort", onAbort, { once: true });

    const collect = (target) => (chunk) => {
      const buffer = Buffer.from(chunk);
      outputBytes += buffer.length;
      if (outputBytes > maxOutputBytes) {
        stop();
        finish(
          reject,
          new WorkerError(failureCode, "The child process produced too much output.", {
            retryable: false,
          }),
        );
        return;
      }
      target.push(buffer);
    };

    child.stdout.on("data", collect(stdout));
    child.stderr.on("data", collect(stderr));
    child.on("error", (error) => {
      finish(
        reject,
        new WorkerError(failureCode, "The child process could not be started.", {
          cause: error,
          retryable: false,
        }),
      );
    });
    child.on("close", (code, processSignal) => {
      finish(resolve, {
        code,
        signal: processSignal,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      });
    });

    if (input === null || input === undefined) child.stdin.end();
    else child.stdin.end(String(input), "utf8");
  });
}

export async function sleep(ms, signal) {
  if (signal?.aborted) throw new WorkerError("aborted", "Sleep cancelled.");
  await new Promise((resolve, reject) => {
    const done = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    const timer = setTimeout(done, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new WorkerError("aborted", "Sleep cancelled."));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
