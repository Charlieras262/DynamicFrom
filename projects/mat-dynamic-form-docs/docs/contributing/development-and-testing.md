---
sidebar_position: 1
title: Development and testing
---

# Development and testing

The repository contains three projects:

| Project | Path | Purpose |
| --- | --- | --- |
| `mat-dynamic-form` | `projects/mat-dynamic-form` | The library. |
| `dynamic-form-sandbox` | `projects/dynamic-form-sandbox` | Angular app to try the library by hand. |
| `mat-dynamic-form-docs` | `projects/mat-dynamic-form-docs` | This documentation (Docusaurus). |

## Requirements

The library is built with Angular 11. Use **Node 14** locally (a [Dockerfile](https://github.com/Charlieras262/DynamicFrom/blob/master/Dockerfile)
is included), or a newer Node with `NODE_OPTIONS=--openssl-legacy-provider` for the commands that use webpack
(`ng test`, `ng serve`). CI uses Node 24.

```bash
npm ci
```

## Spec-driven development

Every change starts with a spec:

1. Write or update the `*.spec.ts` that describes the expected behavior, next to the code it covers.
2. Run the suite and see it fail.
3. Change the code until it passes.
4. For a bug, first add a spec that reproduces it.

```bash
npm run test:lib
```

The command runs the Karma + Jasmine suite once in headless Chrome. Set `CHROME_BIN` if Chrome is not found:

```bash
CHROME_BIN=/usr/bin/google-chrome-stable npm run test:lib
```

Releases are published only if this suite passes.

## Build the library

```bash
npm run build          # dist/mat-dynamic-form
npm run copy-assets    # file type icons
```

## Try it in the sandbox

The sandbox imports the library from `dist/`, so build it first.

```bash
npm run build
npx ngcc
ng serve dynamic-form-sandbox
```

`ngcc` processes the freshly built `dist/` for Ivy; without it `ng serve` fails with `NG6002`.

## Documentation

```bash
cd projects/mat-dynamic-form-docs
npm ci
npm start      # live preview
npm run build  # production build, fails on broken links
```

The docs need Node 20 or newer.

## Releasing

Create a GitHub release with a `vX.Y.Z` tag. The **Publish NPM** workflow builds the library, runs the specs and
publishes the version from the tag to npm.
