import { COURSE, COURSE_END, COURSE_START, type Lesson, type Module } from "@content/course";
import { taskProgress } from "@/lib/assignments";
import { dayKey } from "@/lib/srs";
import type { State } from "@/lib/store";

export const allLessons: Lesson[] = COURSE.flatMap((m) => m.lessons);
export const totalMinutes = allLessons.reduce((a, l) => a + l.minutes, 0);

export function courseProgress(s: State, now: number) {
  const done = allLessons.filter((l) => taskProgress(s, l, now).done);
  const next = allLessons.find((l) => !taskProgress(s, l, now).done) ?? null;
  return {
    done: done.length,
    total: allLessons.length,
    minutesDone: done.reduce((a, l) => a + l.minutes, 0),
    next,
    nextModule: next ? COURSE.find((m) => m.lessons.includes(next)) ?? null : null,
  };
}

/** Index of a module's first lesson in the whole course (for continuous numbering). */
export const lessonOffset = (m: Module): number => allLessons.indexOf(m.lessons[0]!);

export const courseActive = (now: number) => {
  const k = dayKey(now);
  return k >= COURSE_START && k <= COURSE_END;
};

export const minutesLabel = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);
export { COURSE };
