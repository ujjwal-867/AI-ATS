import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function parsePDF(buffer) {
  const data = await pdfParse(buffer);

  return data.text;
}

export async function parseDOCX(buffer) {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value;
}