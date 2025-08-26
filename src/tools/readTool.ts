import { AiTool } from "@effect/ai";
import { Schema } from "effect";

const ReadToolInput = Schema.Struct({
  path: Schema.String.annotations({
    description: "The absolute path of the file to read",
  }),
});

const ReadToolOutput = Schema.Struct({
  content: Schema.String,
}).annotations({
  description: "The content of the file",
});

export const ReadTool = AiTool.make("read", {
  description: "Read the content of a file",
})
  .setParameters(ReadToolInput)
  .setSuccess(ReadToolOutput);
