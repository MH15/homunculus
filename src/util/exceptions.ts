import type { Terminal } from "@effect/platform";

export const isQuitException = (u: unknown): u is Terminal.QuitException =>
  typeof u === "object" &&
  u != null &&
  "_tag" in u &&
  u._tag === "QuitException";
