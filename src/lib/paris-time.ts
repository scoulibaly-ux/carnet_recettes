const TIME_ZONE = "Europe/Paris";
const LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function toParisDateTimeLocal(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

function timeZoneOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  const hour = map.hour === "24" ? "0" : map.hour;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - date.getTime();
}

export function parisLocalToUtc(localIso: string): Date | null {
  const match = LOCAL_PATTERN.exec(localIso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const first = utcGuess - timeZoneOffsetMs(new Date(utcGuess));
  const utc = new Date(utcGuess - timeZoneOffsetMs(new Date(first)));
  if (Number.isNaN(utc.getTime())) return null;
  if (toParisDateTimeLocal(utc) !== localIso) return null;
  return utc;
}

export function parseScheduledAt(localIso: string, now = new Date()) {
  const utc = parisLocalToUtc(localIso);
  if (!utc) return null;
  const min = now.getTime() - 24 * 60 * 60 * 1000;
  const max = now.getTime() + 366 * 24 * 60 * 60 * 1000;
  if (utc.getTime() < min || utc.getTime() > max) return null;
  return utc;
}
