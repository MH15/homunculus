import { AiToolkit } from "@effect/ai";
import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Console, Effect, Layer } from "effect";
import { EditTool } from "./editTool.ts";
import { ListTool } from "./listTool.ts";
import { ReadTool } from "./readTool.ts";

export const toolkit = AiToolkit.make(ListTool, ReadTool, EditTool);

const StubToolkitLayer = toolkit.toLayer({
  list: ({ path }) =>
    Effect.gen(function* () {
      yield* Console.log(`List(${path})`);
      return {
        files: ["yeet.ts"],
        directories: [],
      };
    }),
  read: ({ path }) =>
    Effect.gen(function* () {
      yield* Console.log(`Read(${path})`);
      return {
        content: "ballsack",
      };
    }),
  edit: ({ path, old_string, new_string }) =>
    Effect.gen(function* () {
      yield* Console.log(`Edit(${path}, ${old_string}, ${new_string})`);
      return {
        message: "yeah I got it",
      };
    }),
});

export const RealToolkitLayer = toolkit
  .toLayer(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const pathService = yield* Path.Path;

      return toolkit.of({
        // list: ({ path }) =>
        //   Effect.gen(function* () {
        //     yield* Console.log(`List(${path})`);
        //     const entries = yield* fs.readDirectory(path);
        //     const files: string[] = [];
        //     const directories: string[] = [];

        //     for (const name of entries) {
        //       const fullPath = yield* pathService.isAbsolute(name)
        //         ? name
        //         : pathService.join(path, name);
        //       const stat = yield* fs.stat(fullPath);
        //       if (stat.type === "File") {
        //         files.push(fullPath);
        //       } else if (stat.type === "Directory") {
        //         directories.push(fullPath);
        //       }
        //     }
        //     return {
        //       files: files.sort(),
        //       directories: directories.sort(),
        //     };
        //   }),

        // .pipe(
        //   Effect.catchAll((error) =>
        //     Effect.succeed({ files: [], directories: [] })
        //   )
        // ),

        list: ({ path }) =>
          Effect.gen(function* () {
            yield* Console.log(`List(${path})`);
            const entries = yield* fs.readDirectory(path);
            const files: string[] = [];
            const directories: string[] = [];
            for (const name of entries) {
              // const fullPath = yield* pathService.isAbsolute(name)
              //   ? name
              //   : pathService.join(path, name);
              const stat = yield* fs.stat(name);
              if (stat.type === "File") {
                files.push(name);
              } else if (stat.type === "Directory") {
                directories.push(name);
              }
            }
            return {
              files,
              directories,
            };
          }).pipe(
            Effect.catchAll((error) =>
              Effect.succeed({ files: [], directories: [] })
            )
          ),
        read: ({ path }) =>
          Effect.gen(function* () {
            yield* Console.log(`Read(${path})`);
            const content = yield* fs.readFileString(path);
            return {
              content,
            };
          }).pipe(
            Effect.catchAll((error) =>
              Effect.succeed({ content: error.message })
            )
          ),
        edit: ({ path, old_string, new_string }) =>
          Effect.gen(function* () {
            yield* Console.log(`Edit(${path}, ${old_string}, ${new_string})`);
            return {
              message: "yeah I got it",
            };
          }),
      });
    })
  )
  .pipe(Layer.provide(NodeContext.layer));
