import { AiChat } from "@effect/ai";
import { Terminal } from "@effect/platform";
import { Effect, Schedule, Stream } from "effect";
import { toolkit } from "../tools/index.ts";

export const logStringStream = <E, R>(stream: Stream.Stream<string, E, R>) => {
  return Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal;
    yield* Stream.runForEach(stream, (chunk) =>
      Effect.gen(function* () {
        yield* terminal.display(chunk);
      })
    );
  });
};

// exponential backoff
const policy = Schedule.exponential(500);

export const retryChat = (chat: AiChat.AiChat.Service, prompt: string) =>
  Effect.retry(
    Effect.gen(function* () {
      const stream = chat.streamText({
        prompt: prompt,
        toolkit: toolkit,
      });

      return stream;
    }),
    {
      schedule: policy,
    }
  );
