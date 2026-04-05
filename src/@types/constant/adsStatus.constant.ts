const ADS_STATUS = ["active", "expired", "pending"] as const;
type AdsStatus = (typeof ADS_STATUS)[number];

export {ADS_STATUS,AdsStatus}