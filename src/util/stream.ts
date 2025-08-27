import { AiChat } from "@effect/ai";
import { Terminal } from "@effect/platform";
import { Console, Effect, Schedule, Stream } from "effect";
import { toolkit } from "../tools/index.ts";

// exponential backoff starting at 200ms and stopping after 5 retries
const policy = Schedule.tapOutput(
  Schedule.intersect(Schedule.exponential("200 millis"), Schedule.recurs(5)),
  (n) => Console.log(`Retry attempt #${n}`)
);

export const retryChat = (chat: AiChat.AiChat.Service, prompt: string) =>
  Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal;

    const stream = chat.streamText({
      prompt: prompt,
      toolkit: toolkit,
    });

    const result = yield* stream.pipe(
      Stream.tap((chunk) => terminal.display(chunk.text)),
      Stream.runLast,
      Effect.catchAllDefect((error) => {
        console.error("Fatal error occurred:", error);
        return Effect.fail(error);
      })
    );

    return result;
  }).pipe(
    Effect.retry({
      schedule: policy,
    }),
    Effect.tapError((error) => {
      console.error("Error occurred:", error);
      return Effect.fail(error);
    })
  );
