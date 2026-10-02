import crypto from "node:crypto";
import { env } from "../env";
import type {
  PutObjectInput,
  StorageProvider,
  StoredObject,
  UploadTarget,
} from "./provider";

/**
 * S3-compatible storage provider (AWS S3, Cloudflare R2, MinIO, Backblaze B2,
 * etc.). Implemented with AWS Signature V4 over fetch so no heavyweight SDK is
 * added to the dependency tree.
 *
 * Configure via env: S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID,
 * S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL.
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = "s3";
  private cfg = env.requireS3();

  private objectUrl(key: string): string {
    const base = this.cfg.endpoint.replace(/\/+$/, "");
    return `${base}/${this.cfg.bucket}/${encodeURI(key)}`;
  }

  publicUrl(key: string): string {
    const base = this.cfg.publicUrl.replace(/\/+$/, "");
    return `${base}/${encodeURI(key)}`;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    await this.signedRequest("PUT", input.key, input.data, input.mimeType);
    return {
      key: input.key,
      url: this.publicUrl(input.key),
      mimeType: input.mimeType,
      sizeBytes: input.data.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    await this.signedRequest("DELETE", key, Buffer.alloc(0), "");
  }

  /**
   * Presigned PUT URL (SigV4, query-string style, UNSIGNED-PAYLOAD) so the
   * browser can upload the file directly to S3 without the bytes passing
   * through the app server. Valid for 1 hour.
   */
  async createUploadTarget(key: string, mimeType: string): Promise<UploadTarget> {
    const url = new URL(this.objectUrl(key));
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const service = "s3";
    const region = this.cfg.region;
    const scope = `${dateStamp}/${region}/${service}/aws4_request`;

    // The browser will send Content-Type; sign only host so the preflight and
    // simple PUT both work across S3-compatible providers.
    const signedHeaders = "host";
    const canonicalHeaders = `host:${url.host}\n`;

    const query: Record<string, string> = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${this.cfg.accessKeyId}/${scope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": "3600",
      "X-Amz-SignedHeaders": signedHeaders,
    };
    const canonicalQuery = Object.keys(query)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
      .join("&");

    const canonicalRequest = [
      "PUT",
      url.pathname,
      canonicalQuery,
      canonicalHeaders,
      signedHeaders,
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      scope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const hmac = (k: crypto.BinaryLike, d: string) =>
      crypto.createHmac("sha256", k).update(d).digest();
    const kDate = hmac(`AWS4${this.cfg.secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, "aws4_request");
    const signature = crypto
      .createHmac("sha256", kSigning)
      .update(stringToSign)
      .digest("hex");

    const uploadUrl = `${url.toString()}?${canonicalQuery}&X-Amz-Signature=${signature}`;

    return {
      uploadUrl,
      method: "PUT",
      // Content-Type is optional for the browser to send; S3 stores it if sent.
      headers: mimeType ? { "Content-Type": mimeType } : {},
      key,
      publicUrl: this.publicUrl(key),
    };
  }

  // ── AWS SigV4 signing ───────────────────────────────────────────────────
  private async signedRequest(
    method: "PUT" | "DELETE",
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    const url = new URL(this.objectUrl(key));
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const service = "s3";
    const region = this.cfg.region;

    const payloadHash = crypto.createHash("sha256").update(body).digest("hex");

    const headers: Record<string, string> = {
      host: url.host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    };
    if (contentType) headers["content-type"] = contentType;

    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonicalHeaders =
      Object.keys(headers)
        .sort()
        .map((h) => `${h}:${headers[h]}\n`)
        .join("") ;

    const canonicalRequest = [
      method,
      url.pathname,
      url.search.replace(/^\?/, ""),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      scope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const hmac = (key: crypto.BinaryLike, data: string) =>
      crypto.createHmac("sha256", key).update(data).digest();

    const kDate = hmac(`AWS4${this.cfg.secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, "aws4_request");
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${this.cfg.accessKeyId}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(url.toString(), {
      method,
      headers: { ...headers, authorization },
      body: method === "PUT" ? new Uint8Array(body) : undefined,
    });

    if (!res.ok && !(method === "DELETE" && res.status === 404)) {
      const text = await res.text().catch(() => "");
      throw new Error(`S3 ${method} failed: ${res.status} ${text}`);
    }
  }
}
