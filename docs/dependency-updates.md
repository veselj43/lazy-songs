# Dependency update report

Updated on 2026-10-08 on branch `chore/dependency-updates`, starting from `f91cd1c`.

## Commit steps

1. Upgrade pnpm from 11.7.0 to 12.10.1, align both package-manager declarations and the engine requirement, and use frozen CI installs. The existing [pnpm/action-setup v6](https://github.com/pnpm/action-setup) supports pnpm 12 and reads the version from `package.json`.
2. Apply compatible dependency security updates and targeted esbuild and `@simple-git/argv-parser` overrides.
3. Upgrade the remaining compatible dependencies to their latest stable versions, patch the MCP client introduced by the new ESLint tooling, remove obsolete release-age exceptions, and add streaming archive compatibility tests.

The final direct dependencies match the registry's latest versions except the three deliberately retained versions below. Vitest 5.0.2 and VueUse 15.0.0 passed validation.

## Upgrades reverted after failures

| Dependency                | Attempted | Retained | Failure                                                                                                                                                                   |
| ------------------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`              | 7.0.2     | 6.0.3    | `vue-tsc` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `typescript/lib/tsc`; the ESLint TypeScript tooling also excludes TypeScript 7 in its peer range.                |
| `@tanstack/vue-table`     | 9.2.4     | 8.21.3   | Table generics and sorting APIs changed; the existing helpers and Nuxt UI table types fail type checking.                                                                 |
| `@sentry/nuxt`            | 11.1.0    | 10.75.3  | The existing `sendDefaultPii` initialization option fails type checking. Static generation also warns that its new server compatibility shim cannot be written.           |
| `simple-git` (transitive) | 4.0.2     | 3.36.0   | Nuxt DevTools imports its removed default export, causing `nuxt prepare` to fail during installation. The compatible patched argument parser remains overridden to 2.0.1. |

## Security outcome

`pnpm audit` decreased from 55 advisories (4 critical, 29 high, 16 moderate, 6 low) to 5 (1 critical, 4 high).

| Remaining package   | Advisories                                                                                                                                                                          | Reason                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `simple-git@3.36.0` | [Critical](https://github.com/advisories/GHSA-x6jw-m9v5-85vh), [high](https://github.com/advisories/GHSA-g4wm-2vf7-vfgr), [high](https://github.com/advisories/GHSA-858h-whjf-mvg5) | The patched 4.x release breaks Nuxt DevTools preparation. |
| `braces@3.0.3`      | [High](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)                                                                                                                           | No patched release is available in the registry.          |
| `node-forge@1.4.0`  | [High](https://github.com/advisories/GHSA-86w9-cpqp-85rv)                                                                                                                           | No patched release is available in the registry.          |

These packages come through Nuxt development/build tooling. The audit still counts them because the Nuxt modules are declared under `dependencies`.

The 10-day release-age policy, trust policy, and dependency build-script restrictions remain enabled. Exceptions are scoped to four exact security-patch versions: `source-map-js@1.2.2`, `shell-quote@1.11.0`, `@modelcontextprotocol/client@2.2.0`, and `@modelcontextprotocol/core@2.2.0`.

## Validation

Validated with pnpm 12.10.1 and Node 24.21.0, matching the Node 24 major used by GitHub Actions:

- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run`: 3 tests passed, including UTF-8 metadata and chunked, deflated ZIP extraction.
- `pnpm typecheck`
- `pnpm generate`: all 9 routes generated.
- Prettier checks for changed configuration, documentation, and tests.
- Browser smoke check: the production homepage renders without console errors, and song/playlist routes redirect home when no device is connected.
- A read-only DevTools `simple-git` status operation succeeds with the patched argument parser.

Device transfers were not tested with physical Quest hardware. One tooling peer warning remains: `@bomb.sh/tab@0.0.19` requests `cac@^6.7.14`, while Nuxt CLI installs 7.0.0; the tested CLI commands pass.
