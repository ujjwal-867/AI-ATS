export default function extractPhone(text) {
  const match = text.match(
    /(\+91[\s-]?)?[6-9]\d{9}/
  );

  return match ? match[0] : "";
}