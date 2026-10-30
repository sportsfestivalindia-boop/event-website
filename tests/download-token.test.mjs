import { createHmac, timingSafeEqual } from "node:crypto";

function testDownloadToken() {
  const secret = "test-secret-salt-123";
  const regId = "SF26-A1B2C3";
  const type = "ticket";
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  const data = `${regId}:${type}:${exp}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  const token = Buffer.from(data, "utf8").toString("base64url") + "." + sig;

  // Verify
  const [encodedData, verifySig] = token.split(".");
  const decodedData = Buffer.from(encodedData, "base64url").toString("utf8");
  const [vId, vType, vExp] = decodedData.split(":");
  const expectedSig = createHmac("sha256", secret).update(decodedData).digest("base64url");

  if (vId !== regId) throw new Error("ID mismatch");
  if (vType !== type) throw new Error("Type mismatch");
  if (verifySig !== expectedSig) throw new Error("Sig mismatch");
  console.log("Download token verification test PASSED");
}

testDownloadToken();

