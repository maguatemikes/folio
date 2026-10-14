"use client";

import { useEffect, useState } from "react";

export default function Clock({ timeZone, seconds = false }: { timeZone: string; seconds?: boolean }) {
  const [time, setTime] = useState(seconds ? "--:--:--" : "--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeZone, seconds]);

  return <span className="tabular">{time}</span>;
}
