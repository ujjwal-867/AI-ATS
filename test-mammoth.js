import fs from "fs";
import mammoth from "mammoth";

const buffer = fs.readFileSync("./public/uploads/Ujjwal_Resume.docx");

const result = await mammoth.extractRawText({
  buffer,
});

console.log(result.value);