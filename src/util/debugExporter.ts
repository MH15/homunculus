import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

export const exportChatJson = (chatTimestamp: number, json: object) =>
  Effect.gen(function* () {
    const prettyJson = JSON.stringify(json, null, 2);
    const fileWriter = yield* FileSystem.FileSystem;

    // make the directory if it doesn't exist
    yield* fileWriter.makeDirectory("chat-logs", { recursive: true });

    yield* fileWriter.writeFile(
      `chat-logs/chat-${chatTimestamp}.json`,
      Buffer.from(prettyJson)
    );
  });
