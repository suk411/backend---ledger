import crypto from "crypto";
import axios from "axios";

const APP_ID = process.env.SIMPLYPAY_APP_ID;
const SECRET = process.env.SIMPLYPAY_SECRET;
const BASE_URL = process.env.SIMPLYPAY_BASE_URL;

function generateSign(params, secret) {
  const parseExtra = (extra) => {
    const keys = Object.keys(extra).sort();
    return keys.map((k) => `${k}=${extra[k]}`).join("&");
  };

  const keys = Object.keys(params)
    .filter((k) => k !== "sign")
    .sort();
  let signStr = keys
    .map((k) =>
      typeof params[k] === "object"
        ? `${k}=${parseExtra(params[k])}`
        : `${k}=${params[k]}`,
    )
    .join("&");

  signStr += `&key=${secret}`;
  return crypto.createHash("sha256").update(signStr, "utf8").digest("hex");
}

export async function createPaymentOrder({ merOrderNo, amount, user }) {
  const params = {
    appId: APP_ID,
    merOrderNo,
    currency: "INR",
    amount: String(amount),
    returnUrl: process.env.PAYSIMPLY_RETURN_URL,
    notifyUrl: process.env.PAYSIMPLY_NOTIFY_URL,
    extra: {
      name: user?.name || "user",
      email: user?.email || `${user?.userId}@example.com`,
      mobile: user?.mobileNumber || "911111111112",
    },
  };

  params.sign = generateSign(params, SECRET);

  const res = await axios.post(BASE_URL, params, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  return res.data;
}
