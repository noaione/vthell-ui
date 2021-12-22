const crypto = require("crypto");

const input = process.argv[2];
const tokenSecret = process.argv[3];

if (!input || !tokenSecret) {
    console.log("Usage: node hash-pass.js <password> <token-secret>");
    process.exit(1);
}

const hashedInput = crypto.pbkdf2Sync(input, tokenSecret, 1000, 32, "sha512").toString("hex");
console.info("Hashed Password:", hashedInput);
