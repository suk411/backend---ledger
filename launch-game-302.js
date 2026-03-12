const crypto = require("crypto");
require("dotenv").config();

const {
  GAME_API_URL,
  PROVIDER_CODE,
  OPERATOR_CODE,
  SECRET_KEY,
} = process.env;

if (!GAME_API_URL || !PROVIDER_CODE || !OPERATOR_CODE || !SECRET_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Test player credentials (for local/manual testing only)
const username = "testuser302"; // must be 3–12 chars, lowercase recommended
const password = "Qwer124"; // follow password recommendations in API doc

// Launch parameters
const type = "SL"; // slot games
const gameId = "302";
const lang = "en-US";
const html5 = "1";

// According to doc: MD5(operatorcode + password + providercode + type + username + secret_key), then uppercase
// It is recommended to keep operatorcode/username lowercase and providercode uppercase when signing.
const rawSignature =
  OPERATOR_CODE.toLowerCase() +
  password +
  PROVIDER_CODE.toUpperCase() +
  type +
  username.toLowerCase() +
  SECRET_KEY;

const signature = crypto
  .createHash("md5")
  .update(rawSignature)
  .digest("hex")
  .toUpperCase();

const url =
  `${GAME_API_URL}/launchGames.aspx` +
  `?operatorcode=${encodeURIComponent(OPERATOR_CODE.toLowerCase())}` +
  `&providercode=${encodeURIComponent(PROVIDER_CODE.toUpperCase())}` +
  `&username=${encodeURIComponent(username.toLowerCase())}` +
  `&password=${encodeURIComponent(password)}` +
  `&type=${encodeURIComponent(type)}` +
  `&gameid=${encodeURIComponent(gameId)}` +
  `&lang=${encodeURIComponent(lang)}` +
  `&html5=${encodeURIComponent(html5)}` +
  `&signature=${encodeURIComponent(signature)}`;

console.log("Launch URL for game 302:");
console.log(url);

