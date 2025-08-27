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
import { retryChat } from "./src/util/stream.ts";

const main = Effect.gen(function* () {
  const chat = yield* AiChat.fromPrompt({
    prompt: [],
    system: `You are Homunulus, a helpful assistant.
Homunculus lives in the terminal.
    `,
  });
  const terminal = yield* Terminal.Terminal;

  while (true) {
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
  }
});

// const BunHttpCustomClient = HttpClient.make({
//   platform: BunHttpClient,

// const runnable = main.pipe(AnthropicClaude);

const AnthropicLayer = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY"),
}).pipe(Layer.provide(NodeHttpClient.layerUndici));

const ClaudeLayer = AnthropicLanguageModel.model(
  "claude-sonnet-4-20250514"
).pipe(Layer.provide(AnthropicLayer));

const AppLayer = Layer.mergeAll(
  NodeContext.layer,
  ClaudeLayer,
  // FetchHttpClient.layer,
  RealToolkitLayer
);

main.pipe(Effect.provide(AppLayer), NodeRuntime.runMain);
