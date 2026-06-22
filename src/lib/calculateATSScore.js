export default function calculateATSScore(
  candidateSkills,
  requiredSkills
) {
  const matchedSkills = candidateSkills.filter(
    (skill) =>
      requiredSkills
        .map((s) => s.toLowerCase())
        .includes(skill.toLowerCase())
  );

  return {
    score: Math.round(
      (matchedSkills.length /
        requiredSkills.length) *
        100
    ),
    matchedSkills,
  };
}