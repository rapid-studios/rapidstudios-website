import { randomBytes } from "node:crypto";
import { WorkerError } from "./errors.mjs";
import { sha256Hex, signRequest } from "./hmac.mjs";

const MAX_RESPONSE_BYTES = 1024 * 1024;

export class CmsWorkerApi {
  constructor(config) {
    this.config = config;
  }

  health(body, options) {
    return this.request("health", body, options);
  }

  claim(body, options) {
    return this.request("claim", body, options);
  }

  jobHeartbeat(body, options) {
    return this.request("jobHeartbeat", body, options);
  }

  complete(body, options) {
    return this.request("complete", body, options);
  }

  fail(body, options) {
    return this.request("fail", body, options);
  }

  async request(endpointKey, bodyObject, options = {}) {
    const path = this.config.endpoints[endpointKey];
    const url = new URL(path, this.config.baseUrl);
    if (url.origin !== this.config.baseUrl || url.protocol !== "https:") {
      throw new WorkerError("config_invalid", "An endpoint escaped the pinned HTTPS origin.");
    }

    const method = "POST";
    const body = JSON.stringify(bodyObject);
    const bodyHash = sha256Hex(Buffer.from(body, "utf8"));
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = randomBytes(18).toString("base64url");
    const signature = signRequest(this.config.secret, {
      workerId: this.config.workerId,
      timestamp,
      nonce,
      method,
      path: `${url.pathname}${url.search}`,
      bodyHash,
    });

    const controller = new AbortController();
    const onAbort = () => controller.abort(options.signal?.reason);
    options.signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => controller.abort("request timeout"), this.config.requestTimeoutMs);
    timer.unref?.();

    let response;
    try {
      response = await fetch(url, {
        method,
        redirect: "error",
        cache: "no-store",
        credentials: "omit",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-cms-worker-id": this.config.workerId,
          "x-cms-worker-timestamp": String(timestamp),
          "x-cms-worker-nonce": nonce,
          "x-cms-worker-signature": signature,
        },
        body,
        signal: controller.signal,
      });
    } catch (error) {
      if (options.signal?.aborted) {
        throw new WorkerError("aborted", "The queue request was cancelled.");
      }
      throw new WorkerError("request_failed", "The queue request failed.", {
        cause: error,
        retryable: true,
      });
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    }

    if (response.url && new URL(response.url).origin !== this.config.baseUrl) {
      throw new WorkerError("request_rejected", "The queue response changed origin.");
    }

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_RESPONSE_BYTES) {
      throw new WorkerError("request_rejected", "The queue response was too large.");
    }
    const responseText = await response.text();
    if (Buffer.byteLength(responseText, "utf8") > MAX_RESPONSE_BYTES) {
      throw new WorkerError("request_rejected", "The queue response was too large.");
    }

    if (!response.ok) {
      const leaseLost = response.status === 409 && endpointKey !== "claim" && endpointKey !== "health";
      throw new WorkerError(
        leaseLost ? "lease_lost" : "request_rejected",
        `Queue request returned HTTP ${response.status}.`,
        {
          status: response.status,
          retryable:
            !leaseLost &&
            (response.status === 408 ||
              response.status === 425 ||
              response.status === 429 ||
              response.status >= 500),
        },
      );
    }

    if (!responseText) return null;
    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new WorkerError("request_rejected", "The queue returned invalid JSON.", {
        cause: error,
        retryable: true,
      });
    }
  }
}
