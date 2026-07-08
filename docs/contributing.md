# Contributing

Thanks for helping improve `gha-guardian`.

## Development

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

Run the scanner against the intentionally vulnerable examples:

```bash
pnpm dev scan --path examples/vulnerable
```

## Rule changes

When adding or changing a rule:

- Add or update a file in `src/rules`.
- Include focused Vitest coverage.
- Add examples to the relevant rule doc.
- Keep recommendations actionable and specific.
- Avoid noisy findings where a simple, common safe pattern would be flagged.

## Pull requests

Before opening a PR, run:

```bash
pnpm lint
pnpm test
pnpm build
```

Include a short explanation of behavior changes and any known limitations.
