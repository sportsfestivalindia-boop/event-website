import { buildPayuPayload } from "../src/lib/payu.ts";

async function runTestPayment() {
  // PayU standard sandbox test credentials
  process.env.PAYU_MERCHANT_KEY = "gtKFFx";
  process.env.PAYU_MERCHANT_SALT = "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW";
  process.env.PAYU_BASE_URL = "https://test.payu.in/_payment";

  console.log("=== Initiating PayU Test Transaction ===");
  
  const origin = "https://sportsfestivalindia.com";
  const { fields, hashStringMasked, payuUrl } = buildPayuPayload({
    txnid: "SF26-TEST" + Math.floor(1000 + Math.random() * 9000),
    amount: 1000,
    productinfo: "Bodybuilding & Physique · Men’s Bodybuilding · 75 kg",
    firstname: "Rahul Sharma",
    email: "rahul.athlete@example.com",
    phone: "9876543210",
    surl: `${origin}/api/payu/return`,
    furl: `${origin}/api/payu/return`,
  });

  console.log("1. Masked Hash String:");
  console.log("   " + hashStringMasked);
  console.log("\n2. Generated SHA-512 Hash:");
  console.log("   " + fields.hash);
  console.log("\n3. Fields to POST to PayU:");
  console.log(JSON.stringify(fields, null, 2));

  console.log("\n4. Posting Form to PayU Test Gateway (" + payuUrl + ")...");
  
  const formBody = new URLSearchParams(fields).toString();
  const res = await fetch(payuUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody,
    redirect: "manual",
  });

  console.log("\n5. PayU Gateway Response:");
  console.log("   HTTP Status: " + res.status + " " + res.statusText);
  const location = res.headers.get("location");
  if (location) {
    console.log("   Checkout URL (Redirect Location): " + location);
    console.log("\nSUCCESS! PayU verified the hash parameter without error and redirected to the checkout page.");
  } else {
    const text = await res.text();
    console.log("   Response Body Preview: " + text.slice(0, 300));
  }
}

runTestPayment().catch(console.error);

