import skills from "./skills";

export default function extractSkills(text) {
  const foundSkills = [];

  skills.forEach((skill) => {
    if (
      text.toLowerCase().includes(
        skill.toLowerCase()
      )
    ) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}