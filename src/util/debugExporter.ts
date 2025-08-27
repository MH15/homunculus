import { FileSystem } from "@effect/platform";
import { format } from "date-fns";
import { Effect } from "effect";

export const exportChatJson = (chatTimestamp: number, json: string) =>
  Effect.gen(function* () {
    const prettyJson = JSON.stringify(JSON.parse(json), null, 2);
    const fileWriter = yield* FileSystem.FileSystem;

    // make the directory if it doesn't exist
    yield* fileWriter.makeDirectory("chat-logs", { recursive: true });

    const date = new Date(chatTimestamp);
    const humanReadableTime = format(date, "yyyy-MM-dd_HH-mm-ss");

    yield* fileWriter.writeFile(
      `chat-logs/chat-${humanReadableTime}.json`,
      Buffer.from(prettyJson)
    );
  });
