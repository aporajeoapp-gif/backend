const EVENT_STATUS = ["upcoming", "ongoing", "completed"] as const;
type EventStatus = (typeof EVENT_STATUS)[number];

export {EVENT_STATUS,EventStatus}