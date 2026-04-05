const ROLES = ["admin", "coordinator", "member"] as const;
type Role = (typeof ROLES)[number];

export {ROLES,Role}