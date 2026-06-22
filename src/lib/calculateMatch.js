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

  const score =
    jdSkills.length === 0
      ? 0
      : Math.round(
          (matchedSkills.length / jdSkills.length) * 100
        );

  return {
    score,
    matchedSkills,
    missingSkills,
  };
}