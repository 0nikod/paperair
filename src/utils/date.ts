import { TIMEZONE } from "@consts";

export interface DateParts {
  year: string;
  month: string;
  day: string;
}

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 按站点配置的时区提取日期部分，避免构建机器时区影响归档和 URL。 */
export function getDateParts(date: Date): DateParts {
  const parts = Object.fromEntries(
    datePartsFormatter
      .formatToParts(date)
      .filter(
        ({ type }) => type === "year" || type === "month" || type === "day",
      )
      .map(({ type, value }) => [type, value]),
  );

  if (!parts.year || !parts.month || !parts.day) {
    throw new RangeError(`无法解析日期: ${date.toISOString()}`);
  }

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
}
