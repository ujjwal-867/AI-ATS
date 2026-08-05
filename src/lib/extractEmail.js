export default function extractEmail(text) {
  const match = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/
  );

  return match ? match[0] : "";
}