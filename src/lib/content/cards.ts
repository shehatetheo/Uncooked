import raw from "@content/gen/cards";
import { parseAll } from "./parse";
import { OpenCard } from "./types";

export const cards: OpenCard[] = parseAll(OpenCard, (raw as unknown[][]).flat(), "card");
