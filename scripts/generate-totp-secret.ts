import otplib from "otplib";
import qrcode from "qrcode-terminal";

// Generate a new secret
const secret = otplib.authenticator.generateSecret();

// Configuration for the TOTP
const issuer = "theca"; // Your app name
const accountName = "admin"; // The account/user name

// Generate the otpauth:// URI
const otpauthUrl = otplib.authenticator.keyuri(accountName, issuer, secret);

console.log("═══════════════════════════════════════════════════════════");
console.log("  TOTP Secret Generator for theca Admin");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("📱 Scan this QR code with your authenticator app:\n");

// Generate QR code in terminal
qrcode.generate(otpauthUrl, { small: true }, (qrcode) => {
  console.log(qrcode);
});

console.log("\n───────────────────────────────────────────────────────────\n");
console.log("🔑 Your TOTP Secret (Base32):");
console.log(`   ${secret}\n`);

console.log("📝 Add this to your .env file:");
console.log(`   TOTP_SECRET=${secret}\n`);

console.log("ℹ️  Configuration:");
console.log(`   Issuer: ${issuer}`);
console.log(`   Account: ${accountName}`);
console.log(`   Algorithm: SHA1`);
console.log(`   Digits: 6`);
console.log(`   Period: 30 seconds\n`);

console.log("═══════════════════════════════════════════════════════════");

