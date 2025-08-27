# homunculus

Homunculus is an agentic assistant (think Claude Code, Codex, etc) written in [Effect](https://effect-ts.github.io).

## Available Tools

Homunculus implements the following tools:

- **list** - List items in a directory or path
- **read** - Read the content of a file
- **edit** - Edit the content of a file by replacing specific strings
- **chooseOption** - Present multiple options to the user for decision making

## Development

To install dependencies:

```bash
bun install
nvm use 24
```

To run:

```bash
node --env-file=.env index.ts
```

## Credits

- [Effect](https://effect-ts.github.io) - standard library.
- [Kit Langton](https://www.youtube.com/watch?v=aueu9lm2ubo) - original inspiration.
