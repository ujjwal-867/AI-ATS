import skills from "./skills";

export default function extractJDskills(text) {
  return skills.filter((skill) =>
    text.toLowerCase().includes(
      skill.toLowerCase()
    )
  );
}