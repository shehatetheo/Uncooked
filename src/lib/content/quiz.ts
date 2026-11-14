import raw from "@content/gen/quiz";
import { parseAll } from "./parse";
import { QuizQuestion } from "./types";

export const quiz: QuizQuestion[] = parseAll(QuizQuestion, (raw as unknown[][]).flat(), "quiz question");
