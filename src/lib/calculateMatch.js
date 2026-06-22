export default function calculateMatch(
  candidateSkills,
  jdSkills
) {
  const matchedSkills = candidateSkills.filter(
    (skill) =>
      jdSkills
        .map((s) => s.toLowerCase())
        .includes(skill.toLowerCase())
  );

  const missingSkills = jdSkills.filter(
    (skill) =>
      !candidateSkills
        .map((s) => s.toLowerCase())
        .includes(skill.toLowerCase())
  );

  return {
    score: Math.round(
      (matchedSkills.length /
        jdSkills.length) *
        100
    ),
    matchedSkills,
    missingSkills,
  };
}