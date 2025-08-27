import type { Terminal } from "@effect/platform";

// Stolen from https://github.com/Effect-TS/effect/blob/5f796d96d491173453d0c44a4d74becb445cc61f/packages/platform/src/Terminal.ts#L90
export const isQuitException = (u: unknown): u is Terminal.QuitException =>
  typeof u === "object" &&
  u != null &&
  "_tag" in u &&
  u._tag === "QuitException";
