import { AiTool } from "@effect/ai";
import { Schema } from "effect";

const ChooseOptionToolInput = Schema.Struct({
  options: Schema.Array(Schema.String).annotations({
    description: "The possible next actions to take",
  }),
});

const ChooseOptionToolOutput = Schema.Struct({
  selected: Schema.String.annotations({
    description: "The selected next action to take",
  }),
});

export const ChooseOptionTool = AiTool.make("chooseOption", {
  description: "Ask the user to choose a path forwards from a set of options",
})
  .setParameters(ChooseOptionToolInput)
  .setSuccess(ChooseOptionToolOutput);
