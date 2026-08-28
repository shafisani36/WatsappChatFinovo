const crypto = require("crypto");

// We never store a raw refresh token in the database — only its hash.
// If the database were ever leaked, the hashes alone couldn't be used to log in.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { hashToken };
