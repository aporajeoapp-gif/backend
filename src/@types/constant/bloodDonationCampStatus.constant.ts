const CAMP_STATUS = ["upcoming", "ongoing", "completed"] as const;
type CampStatus = (typeof CAMP_STATUS)[number];

export {CAMP_STATUS,CampStatus}