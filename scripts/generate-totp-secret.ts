import otplib from "otplib";

const secret = otplib.authenticator.generateSecret();

console.log("Your TOTP Secret:", secret);
console.log("\nAdd this to your .env file:");
console.log(`TOTP_SECRET=${secret}`);
