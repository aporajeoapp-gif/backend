const PERMISSIONS = [
  "bus.create", "bus.read", "bus.update", "bus.delete",
  "ferry.create", "ferry.read", "ferry.update", "ferry.delete",
  "doctor.create", "doctor.read", "doctor.update", "doctor.delete",
  "emergency.create", "emergency.read", "emergency.update", "emergency.delete",
  "event.create", "event.read", "event.update", "event.delete",
  "ads.create", "ads.read", "ads.update", "ads.delete",
  "users.create", "users.read", "users.update", "users.delete",
  "blood.create", "blood.read", "blood.update", "blood.delete",
  "*"
] as const;
type Permission = (typeof PERMISSIONS)[number];

export {PERMISSIONS,Permission} 