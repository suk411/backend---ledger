import crypto from "crypto";

// ✅ Fill in your values here
const APP_ID = "c8da3307f66655642e2f6e7beaf970d5";
const SECRET = "28622e9a4ce2df9c60c2863f73114a30";

const params = {
  appId: APP_ID,
  merOrderNo: "2348590239848u209442",
  currency: "INR",
  amount: "500",
  returnUrl: "https://your-site.com/return",
  notifyUrl: "https://your-site.com/notify",
  extra: {
    name: "ram",
    email: "ram@gmail.com",
    mobile: "911111111112",
  },
};

// Helper to flatten `extra` object
function parseExtra(extra) {
  const keys = Object.keys(extra).sort();
  return keys.map((k) => `${k}=${extra[k]}`).join("&");
}

// Generate sign string
function generateSign(params, secret) {
  const keys = Object.keys(params)
    .filter((k) => k !== "sign")
    .sort();

  let signStr = keys
    .map((k) => {
      if (typeof params[k] === "object" && params[k] !== null) {
        return `${k}=${parseExtra(params[k])}`;
      }
      return `${k}=${params[k]}`;
    })
    .join("&");

  signStr += `&key=${secret}`;
  return crypto.createHash("sha256").update(signStr, "utf8").digest("hex");
}

// Run
const sign = generateSign(params, SECRET);
console.log("Sign string:", sign);
