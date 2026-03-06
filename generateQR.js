const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const baseURL = "https://drivealertqr.vercel.app/scan/";
const batchSize = 10;
const outputFolder = "./qr-codes";

// create folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// function to get the last generated QR number
function getLastQRNumber() {
  const files = fs.readdirSync(outputFolder);

  if (files.length === 0) return 0;

  const numbers = files
    .map(file => file.replace("QR", "").replace(".png", ""))
    .map(num => parseInt(num))
    .filter(num => !isNaN(num));

  return Math.max(...numbers);
}

async function generateBatch() {

  const lastNumber = getLastQRNumber();
  const startNumber = lastNumber + 1;

  console.log(`Last QR: ${lastNumber}`);
  console.log(`Generating ${batchSize} new QR codes...`);

  for (let i = startNumber; i < startNumber + batchSize; i++) {

    const code = "QR" + String(i).padStart(5, "0");
    const url = baseURL + code;

    const filePath = path.join(outputFolder, `${code}.png`);

    await QRCode.toFile(filePath, url);

    console.log(`Generated: ${code}`);
  }

  console.log("Batch completed.");
}

generateBatch();