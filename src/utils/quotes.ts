import { QUOTES, type Quote } from "../data/quotes";
import { todayKey } from "./date";

/** deterministic "quote of the day": same quote all day, changes tomorrow */
export function quoteOfTheDay(dateKey: string = todayKey()): Quote {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return QUOTES[hash % QUOTES.length];
}
