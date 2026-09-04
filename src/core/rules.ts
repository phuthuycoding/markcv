/** Word lists for lint. Kept separate so they can be tuned without touching logic. */

/** Self-praise adjectives — readers skip them, interviewers distrust them. */
export const BOAST = [
  "spearheaded", "championed", "rigorous", "rigorously", "comprehensive", "world-class",
  "cutting-edge", "state-of-the-art", "best-in-class", "excellence", "seamlessly",
  "significantly", "dramatically", "highly skilled", "expertly", "passionate",
  "guru", "ninja", "rockstar", "visionary", "unparalleled", "exceptional",
  "extensive experience", "proven track record", "results-driven", "synergy",
];

/** Understating verbs — dangerous next to work of real scale. */
export const WEAK_VERBS = [
  "assisted", "helped", "participated in", "involved in", "took part in",
  "advised on", "supported", "contributed to", "worked on", "was responsible for",
  "responsible for", "familiar with", "exposure to",
];

/** Markers of scale — suspicious when paired with a weak verb. */
export const SCALE_HINTS = [
  "services", "engineers", "developers", "squads", "users", "staff", "events",
  "microservices", "million", "requests", "customers", "merchants", "teams",
];

/** Base-form verbs that often start a bullet — used to catch present-tense slips. */
export const PRESENT_VERBS = [
  "mentor", "advise", "lead", "build", "manage", "review", "run", "own", "drive",
  "design", "maintain", "support", "coordinate", "deliver", "define", "set",
  "introduce", "improve", "handle", "track", "report", "work",
];

/** Tech keywords commonly listed under SKILLS with nothing backing them. */
export const TECH_TOKENS = [
  "kubernetes", "docker", "kafka", "rabbitmq", "spark", "redis", "postgresql", "mysql",
  "mongodb", "graphql", "react", "next.js", "vue", "angular", "svelte", "typescript",
  "golang", "python", "java", "spring boot", "nestjs", "node.js", "php", "laravel",
  "symfony", "flutter", "react native", "terraform", "aws", "gcp", "azure",
  "opentelemetry", "grafana", "prometheus", "elk", "elasticsearch", "playwright",
  "cypress", "jest", "vitest", "oauth", "oidc", "jwt", "ddd", "clean architecture",
  "event-driven", "microservices", "helm", "ci/cd",
];

/** Individual-contributor titles — people-management wording next to them signals a mismatch. */
export const IC_TITLES = ["engineer", "developer", "programmer", "architect", "specialist"];
export const PEOPLE_MGMT = [
  "managed a team of", "team of", "direct reports", "headcount", "performance review",
  "hiring", "interviewing",
];

/**
 * Keywords an interviewer will dig into. Claiming these without evidence falls apart
 * under questioning. The rest (MySQL, Redis, Docker…) are perfectly normal to list
 * under SKILLS and not worth warning about.
 */
export const HEAVY_TOKENS = [
  "kubernetes", "kafka", "spark", "terraform", "opentelemetry", "playwright",
  "cypress", "event-driven", "microservices", "ddd", "clean architecture",
  "oauth", "oidc", "graphql", "spring boot", "flutter", "react native", "helm",
  "aws", "gcp", "azure", "elasticsearch", "prometheus",
];
