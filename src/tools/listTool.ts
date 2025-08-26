import { AiTool } from "@effect/ai";
import { Schema } from "effect";

const ListToolInput = Schema.Struct({
  path: Schema.String.annotations({
    description: "The path to list items from",
  }),
});

const ListToolOutput = Schema.Struct({
  files: Schema.Array(Schema.String),
  directories: Schema.Array(Schema.String),
}).annotations({
  description: "A list of items with their names and types",
});

export const ListTool = AiTool.make("list", {
  description: "List items",
})
  .setParameters(ListToolInput)
  .setSuccess(ListToolOutput);
