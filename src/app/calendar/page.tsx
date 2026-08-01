import type { Metadata } from "next";
import { getCalendar } from "@/lib/data";
import { getDict } from "@/i18n";
import CalendarView from "@/components/calendar-view";

const t = getDict();

export const metadata: Metadata = { title: t.calendar.title };

export default function CalendarPage() {
  const events = getCalendar();
  return <CalendarView events={events} />;
}
