import skills from "./skills";

export default function extractSkills(text) {
  const foundSkills = [];
  const lowerText = text.toLowerCase();

  for (const skill of skills) {
    const lowerSkill = skill.toLowerCase();

    // Prevent matching C inside C++
    if (
      lowerSkill === "c" &&
      lowerText.includes("c++")
    ) {
      continue;
    }

    if (lowerText.includes(lowerSkill)) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
}