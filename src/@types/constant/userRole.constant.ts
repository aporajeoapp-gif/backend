const ROLES = ["super_admin", "admin", "coordinator", "member"] as const;
type Role = (typeof ROLES)[number];

export {ROLES,Role}