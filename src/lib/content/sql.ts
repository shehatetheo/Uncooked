import raw from "@content/gen/sql";
import { parseAll } from "./parse";
import { SqlProblem } from "./types";

export const sqlProblems: SqlProblem[] = parseAll(SqlProblem, raw, "sql problem");
export const sqlById = new Map(sqlProblems.map((p) => [p.id, p]));
