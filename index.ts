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
import { Config, Console, Effect, Layer, Stream } from "effect";
import { RealToolkitLayer, toolkit } from "./src/tools/index.ts";

const main = Effect.gen(function* () {
  const chat = yield* AiChat.fromPrompt({
    prompt: [],
    system: `You are Homunulus, a helpful assistant.
Homunculus lives in the terminal.
    `,
  });

  while (true) {
    const input = yield* Prompt.text({ message: "Homunulus want what?" });
    // let response = yield* chat.generateText({
    //   prompt: input,
    //   toolkit: toolkit,
    // });

    const stream = chat.streamText({
      prompt: input,
      toolkit: toolkit,
    });

    let response: ReturnType<typeof chat.generateText> | null = null;

    const terminal = yield* Terminal.Terminal;

    yield* stream.pipe(
      Stream.runForEach((chunk) =>
        Effect.gen(function* () {
          yield* terminal.display(chunk.text);
          response = chunk;
        })
      )
    );
    yield* terminal.display("\n");

    // yield* Console.log(response.text);

    let turn = 0;

    while (response.toolCalls.length > 0) {
      yield* Console.log(`Turn ${turn}`);
      response = yield* chat.generateText({
        prompt: input,
        toolkit: toolkit,
      });
      yield* Console.log(response.text);
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
