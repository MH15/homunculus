import { AiTool } from "@effect/ai";
import { Schema } from "effect";

const EditToolInput = Schema.Struct({
  path: Schema.String.annotations({
    description: "The absolute path of the file to edit",
  }),
  old_string: Schema.String.annotations({
    description: "The string to search for and replace",
  }),
  new_string: Schema.String.annotations({
    description: "The new string to replace the old string with in the file",
  }),
});

const EditToolOutput = Schema.Struct({
  message: Schema.String,
}).annotations({
  description: "Whether the edit was successful",
});

export const EditTool = AiTool.make("edit", {
  description: "Edit the content of a file",
})
  .setParameters(EditToolInput)
  .setSuccess(EditToolOutput);
