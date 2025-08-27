import { FileSystem, Path } from "@effect/platform";
import { format } from "date-fns";
import { Effect } from "effect";

const CHAT_LOG_PATH = "chat-logs";

export const exportChatJson = (chatTimestamp: number, json: string) =>
  Effect.gen(function* () {
    const pathService = yield* Path.Path;
    const fileWriter = yield* FileSystem.FileSystem;

    const prettyJson = JSON.stringify(JSON.parse(json), null, 2);
    const date = new Date(chatTimestamp);
    const humanReadableTime = format(date, "yyyy-MM-dd_HH-mm-ss");
    const path = pathService.join(
      CHAT_LOG_PATH,
      `chat-${humanReadableTime}.json`
    );

    yield* fileWriter.makeDirectory(CHAT_LOG_PATH, { recursive: true });
    yield* fileWriter.writeFile(path, Buffer.from(prettyJson));
  });
