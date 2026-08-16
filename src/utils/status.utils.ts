const STATUS_TIME_ZONE = "Asia/Kolkata";

const getDateKey = (value: string | Date | undefined | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-CA", {
    timeZone: STATUS_TIME_ZONE,
  });
};

export const resolveEventStatus = (date: string | Date | undefined | null) => {
  const eventDate = getDateKey(date);
  const today = getDateKey(new Date());

  if (!eventDate) return "upcoming";
  if (eventDate < today) return "completed";
  if (eventDate === today) return "ongoing";
  return "upcoming";
};

export const resolveBloodCampStatus = (date: string | Date | undefined | null) => {
  const campDate = getDateKey(date);
  const today = getDateKey(new Date());

  if (!campDate) return "upcoming";
  if (campDate < today) return "completed";
  if (campDate === today) return "ongoing";
  return "upcoming";
};

export const resolveAdStatus = (
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null,
) => {
  const start = getDateKey(startDate);
  const end = getDateKey(endDate);
  const today = getDateKey(new Date());

  if (!start || !end) return "pending";
  if (today < start) return "pending";
  if (today > end) return "expired";
  return "active";
};

export { getDateKey };
