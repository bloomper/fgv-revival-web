<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read
the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next`
package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at
`node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted
change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nyuppsättning Web — project notes

Next.js 16 App Router + React 19 frontend for Nyuppsättning, which supports the steering groups of
Chalmersspex revivals. It is backed by `fgv-revival-server`'s GraphQL API. Stack and setup: `README.md`.
PR process: `CONTRIBUTING.md`. Product spec, specs, plans and tasks: the `fgv-revival-spec` repository.

## Commands

- `npm run dev` / `build` / `start`
- `npm run lint` (ESLint), `npm run typecheck` (tsc) — note typecheck only covers `src/**`, so
  `next.config.ts`, `codegen.ts` and `eslint.config.mts` are *not* type-checked by it.
- `npm run test` (Vitest), `npm run test:e2e` (Playwright)
- `npm run gql-codegen` — regenerate `src/gql/` from the server's schema files in a sibling
  `fgv-revival-server` checkout (introspection is off). Commit the result: CI never regenerates it.

CI (`.github/workflows/build.yml`): lint → typecheck → test:coverage → build, then E2E as a
separate job. Node version comes from `.nvmrc`.

**Don't run `npm run format`.** `.prettierrc` sets `tabWidth: 2`, the codebase is 4-space
indented, and `.prettierignore` doesn't exclude `src/` — it would reformat the whole tree.
ESLint enforces double quotes.

## File conventions

- **A module's directive and its filename must agree**, both ways:
    - `"use client"` ⇔ `*.client.ts(x)` — components *and* hooks (`use-lazy-full.client.ts`).
    - `import "server-only"` ⇔ `*.server.ts` (libs, utils).
    - `"use server"` ⇔ `*.server.ts` too — the `actions.server.ts` server-action modules. Don't add
      `server-only` to a `"use server"` file; the directive already pins it to the server.
- Three standing exceptions, all deliberate:
    - `src/auth.ts` — `server-only`, but keeps the conventional Better Auth entry-point name.
    - Next.js reserved filenames (`page.tsx`, `layout.tsx`, `error.tsx`, `global-error.tsx`) cannot
      be renamed, so a `"use client"` one keeps its required name.
    - shadcn-owned files keep their upstream names so `shadcn add` stays a clean overwrite. That is
      `src/components/ui/**` *and* `src/hooks/use-mobile.ts`, which ships with the sidebar component
      and is imported by it as `@/hooks/use-mobile`.
- `src/gql/**` (generated) and `src/components/ui/**` (shadcn) are ESLint-ignored — don't hand-edit.

## Rendering and caching — Cache Components is ON

`cacheComponents: true` in `next.config.ts`. Consult `node_modules/next/dist/docs/` before
changing routing or data fetching; this area differs sharply from older Next.

- `src/app/(app)/layout.tsx` awaits `auth()` and substitutes a logged-out landing page for
  `{children}`, so no `(app)` route renders without a session. It therefore carries
  `export const instant = false`, which also opts the whole `(app)` tree out of static-shell
  validation (the highest `instant` in a tree wins for that check).
- **A new route that fetches data at the top of the page needs a `loading.tsx` beside it**, or it
  can't prerender a shell. Reuse `DataTableSkeleton`; see `src/app/(app)/revivals/manage/loading.tsx`.
- The root layout's metadata must stay a **static** `export const metadata`. `/_not-found` inherits
  it, so a `generateMetadata()` that reads cookies (e.g. `getTranslations()`) blocks metadata on
  every route. The locale-correct title is applied client-side in `src/app/provider.client.tsx`.
- `"use cache"` cannot wrap anything reading cookies/headers.

## i18n

- Locale is a **cookie**, not a URL segment — there is no `[locale]` route. `src/i18n/request.ts`
  reads it; `normalizeLocale()` in `src/utils/utils.server.ts` validates it against
  `SUPPORTED_LOCALES` / `DEFAULT_LOCALE` (default `sv`).
- Messages: `messages/{sv,en}.json`. Client-side switching lives in `src/app/provider.client.tsx`
  (`changeLocale` sets the cookie, swaps messages, then `router.refresh()`).

## Auth and authorization

- **Better Auth** (`better-auth@1.7`) + Keycloak, configured in `src/auth.ts` via the
  `genericOAuth` plugin's `keycloak()` helper. There is **no database**: omitting `database`
  puts Better Auth in stateless mode — the session lives in a JWE `better-auth.session_data`
  cookie and the Keycloak access/refresh/id tokens in an encrypted, chunked
  `better-auth.account_data` cookie.
- Discovery runs once at boot and supplies the JWKS used to verify Keycloak's `id_token`.
  `src/auth.ts` also pins the fixed `…/protocol/openid-connect/*` paths explicitly — they are the
  fallback that keeps login working if discovery is unreachable at startup (without them Better
  Auth drops the provider until the server restarts).
- **`getSessionContext()` in `src/utils/auth.server.ts` is the single entry point for server-side
  auth.** It resolves the session, then the Keycloak access token from the account cookie (refreshing when near expiry),
  then decodes the roles out of that token's
  `resource_access["fgv-revival"].roles`. It is wrapped in React `cache()` — the layout, urql
  and every policy check call it within one render. `requireUser()` and `getAccessToken()` are thin
  wrappers over it; a token that cannot be refreshed reads as logged out.
- `src/proxy.ts` (Next 16's middleware file) refreshes the account cookie and forwards the
  resulting `Set-Cookie`. It exists because **RSC renders cannot write cookies** — without it a
  token rotated during a plain navigation would be recomputed every render and never persist. It
  never blocks or redirects.
- Gate server code with `Policies` (`src/utils/policy.server.ts`) plus `withPolicyPage` /
  `withPolicyAction` / `withPolicyRoute` (`src/utils/route.server.ts`). Pages wrap their body in
  `withPolicyPage(Policies.<entity>.require<Op>, async (authz) => …)` — take roles from `authz`
  rather than calling the session again. Don't hand-roll role checks —
  `requireUser` / `requireAnyRole` are in `src/utils/auth.server.ts`. Roles: `USER | SUPER_ADMIN | OBSERVER`. `USER` is required for
  any access; without it the `(app)` layout redirects to `/no-access`.
- **Revival permissions are never computed in the web.** Each `Revival` carries a `permissions` object
  (`canEditCore`, `canEditDetails`, `allowedStatuses`, `canManageDirecteurs`, `canManageSteeringGroup`)
  computed by the server's `AccessPolicy`. Show or hide controls from it; the server enforces every rule
  anyway. Don't re-derive directeur or steering-group rules from the role and status.
- Client side: `src/lib/auth-client.ts` (`useSession`, `signOut`); no session provider is needed.
  Logout uses `signOut({disableRedirect: true})` and appends `ui_locales`/`theme` to the returned
  Keycloak `end_session` URL via `appendLogoutParams` (`src/utils/auth.ts`).
- Env: Better Auth reads only `AUTH_SECRET` (legacy alias), `BETTER_AUTH_SECRET`,
  `BETTER_AUTH_SECRETS`, `BETTER_AUTH_TRUSTED_ORIGINS` and `BETTER_AUTH_URL` — Auth.js's
  `AUTH_URL` / `AUTH_TRUST_HOST` do nothing. `NEXT_PUBLIC_AUTH_KEYCLOAK_ID` is gone — only the
  server needs the client id now, because Better Auth builds the logout URL.
- **No `NEXT_PUBLIC_*` variables.** They are inlined at build time, and one published image must
  serve every environment. Read config on the server at request time (after `await connection()`
  or another request-time API, so it isn't prerendered) and pass it to client components as
  props — see the account URL in `src/app/(app)/layout.tsx`.

## Data layer

- Server-side GraphQL goes through `runQuery` / `runMutation` / `runMutationField` / `mutateForData`
  in `src/lib/graphql.server.ts`; the urql client (`src/lib/urql.server.ts`) injects the access token.
- Each area has a small lib with explicit GraphQL documents: `src/lib/revival/revival.server.ts`,
  `src/lib/member/member.server.ts`, `src/lib/spex/spex.server.ts`, `src/lib/guide/guide.server.ts`,
  `src/lib/decision-log/log.server.ts`, `src/lib/meeting/meeting.server.ts`, `src/lib/checklist/checklist.server.ts` and
  `src/lib/checklist/template.server.ts`.
- The server's plain HTTP endpoints (guide PDF, log import) go through `apiFetch` in `src/lib/api.server.ts`, which
  adds the token on the server. The browser reaches the PDF only through the route handler `/api/guide-pdf`.
- **Guide chapters are free-form.** A version has any number of chapters, each with a `key` that stays the same
  across versions, ordered by place and numbered from 1 in the UI; there is no `Phase` enum any more. Reading is one
  chapter per page (`[chapterKey]` routes) with `GuideChapterNav` (a bar and bottom sheet on phones, a list beside the
  text from `lg`) and `GuideChapterPager`.
- A revival's chapter checklists follow its pinned version on the server: one per chapter, and the one for a chapter
  the version lacks is **deleted with its items** when the revival moves to that version. That is the only deletion in
  checklists, so the web confirms it three times: removing the chapter in the draft (typed title, plus
  `guideChapterRemovalImpact`), publishing a draft that removed chapters, and changing a revival's version
  (`Revival.guideVersionChangeImpact`), each through `RemovalWarning`.
- Guide Markdown is rendered only through `src/components/guide/guide-markdown.tsx`: no `rehype-raw`, and only the
  elements FR-010 allows, so raw HTML stays text and images are never loaded. Guide text has a Swedish and an optional
  English version; pick with `pickText` from `src/components/guide/localized.ts`.
- Free text the steering group writes (log rows, comments, meeting notes, checklist items, owner names) is rendered
  only through `src/components/plain-text.tsx`: plain text with line breaks and linkified http(s) URLs, never Markdown
  or HTML.
- Mutations invalidate by cache tag (`config.cacheTag` + `revalidateTag`). Server actions live in
  `src/app/(app)/<entity>/actions.server.ts` and validate input with the entity's Zod schema
  (`src/lib/<entity>/schema.ts`) before calling the lib.
- Codegen has two targets (`codegen.ts`): `src/gql/schema.ts` for domain types/enums, and the
  client preset in `src/gql/` for typed `graphql()` documents. Fragment masking is off, and enums
  are re-used from `./schema` so identities match.
- Errors carry `extensions.code`: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` (also for revivals the
  caller may not see), `BAD_REQUEST`, `CONFLICT` (someone else changed it: ask to reload) and
  `SPEXREGISTER_UNAVAILABLE` (show "temporarily unavailable", keep everything else working).
- Mutations send the `version` (or, for status, the `from` status) the user saw.

## Tables and forms

`@tanstack/react-table` v9 with React Compiler (`reactCompiler: true`). Three traps, all
previously hit in `spexregister-web`:

- `useTable()` returns a **new object on every state change**. Never put `table` in a `useEffect`
  dependency array — derive from state instead, as `src/components/data-table.client.tsx` does.
- Under React Compiler, a memoized cell reading live `row`/`table` methods off an otherwise stable
  object never updates. Pass primitives as props.

Forms use `react-hook-form` + `zodResolver`.

## Consent and visitor statistics

The cookie banner is c15t (`src/components/consent-manager.client.tsx`) in offline mode with only the `necessary`
category: it informs, it asks for nothing, since the application sets only strictly necessary cookies and Umami sets
none. E2E's `loginAs` accepts it after each login.

Umami, self-hosted in `fgv-infra-deploy`, reached server-side at `UMAMI_URL` (`http://umami-server:3000` on the
shared network). Browsers never talk to it: `src/app/stats/` serves the tracker as `/stats/script.js` and forwards
`/stats/api/send`. The forwarder passes the browser's IP (`cf-connecting-ip`) and user agent, or every visit looks
like one visitor from the server. `src/components/umami.tsx` renders nothing unless `UMAMI_URL` and
`UMAMI_WEBSITE_ID` are both set, and sets `data-exclude-search`, so query strings are never sent.

Custom events go through `track()` (`src/utils/umami.ts`), a no-op when the tracker isn't loaded. Umami records the
page path with every event, so don't repeat it. Event data is enum values, counts and booleans only — never names,
emails, revival or member ids or typed text; Umami cannot remove a single field afterwards. Events: `revival-create`,
`revival-status` (`from`, `to`), `revival-details-save`, `member-add` (`role`, `capabilities` count),
`member-capabilities` (`count`), `member-remove`, `command-palette`, `language-change` and `theme-change`.

## Testing

- Unit: Vitest, tests in `__tests__/` beside the code.
- E2E: Playwright against a real `next build && next start` on port 3100, with
  `e2e/mock-backend.mjs` standing in for the backend on 4100, one spec per user story (wired through `API_*` env in
  `playwright.config.ts`). The same mock also acts as a **mini-Keycloak** (discovery, authorize,
  token, JWKS, userinfo, logout), and `e2e/auth.setup.ts` signs in through a real OIDC
  authorization-code round-trip before saving `storageState`. Better Auth's cookies are encrypted
  blobs with no public minting API, so this is the supported way — don't try to forge them.
- All test data is fictitious.

## Dependency notes

- `graphql` is on 17.x. `@0no-co/graphql.web` must stay **≥ 1.3.4**: earlier versions cap their
  optional peer range at `^16`, which makes npm install a second nested `graphql@16` under
  `@urql/core` and breaks `npm run typecheck` with `Kind.DOCUMENT` vs `"Document"` mismatches.
- TypeScript runs **side by side**: `typescript` is aliased to `@typescript/typescript6` (the TS 6 JS
  API, which typescript-eslint needs — its peer range stops at `<6.1`), and `@typescript/native` is
  TS 7, which owns the `tsc` bin, so `npm run typecheck` is TS 7. `next build` resolves `typescript`
  and checks with `tsc6`. Collapse to a plain `typescript@^7` once typescript-eslint supports the
  TS 7.1 API (typescript-eslint#10940).
