console.log("Hello via Bun!");

import { AiChat } from "@effect/ai";
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { Prompt } from "@effect/cli";
import { Terminal } from "@effect/platform";
import {
  NodeContext,
  NodeHttpClient,
  NodeRuntime,
} from "@effect/platform-node";
import { Config, Console, Effect, Layer, Option } from "effect";
import { RealToolkitLayer } from "./src/tools/index.ts";
import { exportChatJson } from "./src/util/debugExporter.ts";
import { isQuitException } from "./src/util/exceptions.ts";
import { retryChat } from "./src/util/stream.ts";

const main = Effect.gen(function* () {
  const chatTimestamp = Date.now();

  const cwd = process.cwd();

  const chat = yield* AiChat.fromPrompt({
    prompt: [],
    system: `You are Homunulus, a helpful assistant.
Homunculus lives in the terminal.
The current location is at ${cwd}.
    `,
  });

  const terminal = yield* Terminal.Terminal;

  // Outer loop.
  while (true) {
    // Only main user input.
    const input = yield* Prompt.text({ message: "Homunulus want what?" });

    const chatAndStream = Effect.gen(function* () {
      const stream = yield* retryChat(chat, input);
      return Option.getOrThrow(stream);
    });

    let unwrapped = yield* chatAndStream;

    yield* terminal.display("\n");

    let turn = 0;
    while (unwrapped.toolCalls.length > 0) {
      yield* Console.log(`Turn ${turn}`);
      unwrapped = yield* chatAndStream;
      yield* terminal.display("\n");

      turn++;
    }

    yield* exportChatJson(chatTimestamp, unwrapped);
  }
});

const AnthropicLayer = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY"),
}).pipe(Layer.provide(NodeHttpClient.layerUndici));

const ClaudeLayer = AnthropicLanguageModel.model(
  "claude-sonnet-4-20250514"
).pipe(Layer.provide(AnthropicLayer));

const AppLayer = Layer.mergeAll(
  NodeContext.layer,
  ClaudeLayer,
  RealToolkitLayer
);

main.pipe(
  Effect.catchAll((error) => {
    if (isQuitException(error)) return Console.error("Goodbye!");
    return Console.error("Unexpected error occurred:", error);
  }),
  Effect.provide(AppLayer),
  NodeRuntime.runMain
);
