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
  can't prerender a shell. Build it from `Skeleton` (`src/components/ui/skeleton.tsx`); see
  `src/app/(app)/revivals/manage/loading.tsx`.
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
  `requireUser` / `requireAnyRole` are in `src/utils/auth.server.ts`. Roles: `USER | SUPER_ADMIN | OBSERVER`. `USER` is
  required for
  any access; without it the `(app)` layout redirects to `/no-access`.
- A page refused by its policy shows `src/app/forbidden.tsx` (Next's `forbidden()`, enabled by
  `experimental.authInterrupts`); a user without `USER` is redirected to `/no-access` instead.
- Where the server refuses writes (super admins and observers only read a revival's log, meetings, checklists and
  suggestions), `ReadOnlyNotice` (`src/components/revival/read-only-notice.tsx`) says why instead of hiding the
  controls silently.
- **Revival permissions are never computed in the web.** Each `Revival` carries a `permissions` object (`canEditCore`,
  `canEditDetails`, `allowedStatuses`, `canManageDirecteurs`, `canManageSteeringGroup`,
  `canReadBudget`, `canWriteBudget`, …) computed by the server's `AccessPolicy`. Show or hide controls from it; the
  server enforces every rule
  anyway. Don't re-derive directeur or steering-group rules from the role and status.
- Directeurs and steering group members are picked among the FGV realm's users (`revivalMemberCandidates`). An email
  that is no user's is invited: the server creates a Keycloak user without roles and Keycloak emails them; a super
  admin then grants `USER`. `DIRECTORY_UNAVAILABLE` means Keycloak cannot be searched; typing an address still works.
- **Participants and helpers (M6a) log in with their FGV account too — there are no personal links.** Inviting them
  (`participantsInvite`) gives them a `PARTICIPANT`/`HELPER` role waiting on their email address, claimed when they log
  in with it, exactly as directeurs and steering group members are; a super admin grants `USER`. They see their revival
  only while it is `OPEN`. `permissions.isParticipant` routes them: the revival layout (which reads only the light
  `RevivalShell` query, since participants may not read `members`, `workSummary` and the like) shows neither tabs nor
  title, `/revivals/[id]` redirects to `/revivals/[id]/me`, and revival cards and the home page link them straight
  there. `canReadWork` gates the steering group's work; `canReadParticipants` (not observers) the Participants tab.
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
  `src/lib/decision-log/log.server.ts`, `src/lib/meeting/meeting.server.ts`, `src/lib/checklist/checklist.server.ts`,
  `src/lib/checklist/template.server.ts`, `src/lib/catalog/catalog.server.ts`, `src/lib/event/event.server.ts`
  (events, event types and calendar links), `src/lib/budget/budget.server.ts` (a revival's budget),
  `src/lib/budget/reference.server.ts` (budget categories, reference figures, event type budget lines) and
  `src/lib/spex-calendar/spex-calendar.server.ts` (the Chalmersspex dates and the cross-revival timeline) and
  `src/lib/participant/participant.server.ts` (participants, invitations, referrals and the participant's own page;
  `contact.ts` beside it builds `wa.me` links and names) and `src/lib/material/material.server.ts` (materials, the
  inventory and link services) and `src/lib/closing/closing.server.ts` (closing signals, membership, the sync to
  Spexregister and anonymization) and `src/lib/audit/audit.server.ts` (a record's history) and
  `src/lib/news/news.server.ts` (news).
- **Events (M4)** live on the revival's Events tab (`/revivals/[id]/events`, `?view=timeline` for the timeline of
  events, shows and meetings, `?cancelled=1` for cancelled ones); event types are a super admin list
  (`/admin/event-types`) that is retired, never deleted. Proposals (`Revival.eventProposals`) and the distance from the
  premiere (`Event.daysFromPremiere`) come from the server; an event's checklist is made and kept in step by the server.
- **The budget (M5)** is the revival's Budget tab (`/revivals/[id]/budget`, with `lines`, `transactions` and
  `scenarios` routes), shown only when `permissions.canReadBudget`; `Revival.budget` is null for anyone else. Only the
  directeur and steering group members with `FINANCE` write it (`canWriteBudget`); `BudgetReadOnlyNotice` says so to
  the others. Totals, category summaries, proposals from event types and scenario results all come from the server;
  the web only adds up what it shows (in öre, `src/lib/budget/amount.ts`). Lines are removed and transactions
  cancelled, never deleted. Budget categories (`/admin/budget-categories`, a catalog with a kind fixed on create and
  a role), reference figures (`/admin/reference-figures`) and the Chalmersspex dates (`/admin/spex-calendar`, which
  the timeline at `/revivals/manage?view=timeline` checks for clashing show weeks) are super admin lists.
- **Participants (M6a)** are the revival's Participants tab (`/revivals/[id]/participants`, `?removed=1` for removed
  ones), shown when `permissions.canReadParticipants`; contact details and dietary needs come back null for those who
  may not read them, and fees are marked paid by budget writers (`canWriteBudget`). Names and contact details live in
  Spexregister, so the list, the candidates and the positions are fetched apart and `SPEXREGISTER_UNAVAILABLE` leaves
  the counts and settings working. The participant's own page (`/revivals/[id]/me`) is phone-first and WCAG 2.2 AA:
  44px targets (`TOUCH_FIELD`), every error tied to its field (`describedBy`, `FieldErrorText` in
  `src/components/participation/participation-section.tsx`), and one `ParticipationSection` per part so later
  milestones add theirs without touching the others. Under the React Compiler, a form that stays open after saving
  resets with `form.reset(values, {keepFieldsRef: true})`: a plain reset drops the registered inputs for good.
- **Staffing and mailings (M6b)** are the Staffing tab (`/revivals/[id]/staffing`, `?event=` and `?view=matrix`;
  `canReadStaffing`, writes `canWriteStaffing`: the directeur or `STAFFING`) and the Mailings tab
  (`/revivals/[id]/mailings`, `new?template=&event=` drafts from a plan entry, `[mailingId]` edits, sends and retries;
  `canReadMailings`, `canDraftMailings`, `canSendMailings`: the directeur or `COMMS`), libs
  `src/lib/staffing/staffing.server.ts` and `src/lib/mailing/mailing.server.ts`. The plan and audiences are computed by
  the server; the web prefills a draft from the template in the reader's language and shows `mailingAudiencePreview`
  live and again in the send confirmation. Mailing bodies render through `GuideMarkdown`, as the email does.
  Prints are pages (`/revivals/[id]/staffing/print?event=` or `?person=`) with print CSS (`print:hidden`, and the
  sidebar hidden in `globals.css`), never a server PDF. The participant page adds Schedule, Availability, My shifts and
  Open shifts. The mailing plan's templates are a super admin list (`/admin/mailing-templates`) with the due rule as a
  `RelativeDeadlineField`.
- **Materials and inventory (M8)** are the Materials tab (`/revivals/[id]/materials` and `/materials/inventory`,
  `?removed=1` for writers), shown when `permissions.canReadMaterials` (not observers), written with
  `canWriteMaterials`. Materials
  are **links only** — nothing is uploaded — rendered with `rel="noopener noreferrer" target="_blank"`. The server
  recognises a link's service from its host (`LinkService.hosts`, kept under `/admin/link-services`: the catalog
  editor with its `extra` fields); `src/lib/material/hosts.ts` mirrors the rule only for the hint shown while typing,
  and `Material.serviceChosen` says whether a saved service was picked or recognised.
  Participants see theirs (for all participants, or for their position) as a section on `/me`.
- **Closing (M7)** is the revival's Closing tab (`/revivals/[id]/closing`, readers of the work; always last, marked from
  `CLOSING` on), lib `src/lib/closing/closing.server.ts`. `Revival.closing` gives the signals (result, loan, the surplus
  decision — a DECISION tagged "överskott"/"surplus", which `LogEntryDialog`'s `initial` prefills — suggestions, the
  last sync). FGV membership is `membershipSet` (`canSetMembership`), replacing every mark at once. The sync to
  Spexregister (`canSync`) shows `syncPreview`, starts with its `hash` (CONFLICT when the preview changed) and polls
  `syncRun` every 2 s through a server action while `RUNNING`; a failed run is resumed by starting again, which writes
  only what is missing. Archiving a revival whose sync never completed warns first (`RevivalStatusSelect`).
- **Anonymization (M7, section 7)** removes the people from a revival for good: `revivalAnonymize` (`canAnonymize`,
  the revival's title typed as confirmation, or its id while Spexregister is down). Login data is kept until the
  revival is deleted or anonymized; archived and rejected revivals are anonymized automatically 36 months after that
  status was set (`closing.autoAnonymizeOn`). `Revival.anonymizedAt` puts a banner on every revival page and a badge on
  `/revivals/manage`; the page then hides membership and sync.
- **History** is read only and comes from the server's Envers audit trail (`revisions(type, id)`, audit.graphqls):
  decision log rows, checklist items, events, budget lines, transactions, materials and news. Every row menu (and
  each checklist item) has a History item for whoever reads the record, so the actions column is shown to readers
  too, with the write items behind `canWrite`. `HistoryDialog` (`src/components/history/`) fetches through
  `getRevisionsAction` when it opens. The server sends values already shaped by `FieldKind` and ids already resolved
  to names; `historyValue` only formats dates, instants, amounts and booleans and translates enum values through the
  labels the page already uses (`ENUM_LABELS`). Field labels live under `History.fields.<TYPE>`. Nothing is restored
  from the history.
- **Upcoming revivals** are on the start page for everyone with access (`upcomingRevivals`, `UpcomingRevivals` in
  `src/components/revival/upcoming-revivals.tsx`): revivals being organised or open whose last show has not passed,
  with only their title, premiere and shows, since participants and plain users may not read the revivals
  themselves. Proposed, approved and rejected ones are never there.
- **News** is shown on the start page (the latest six published, `NewsList`) and kept by super admins under
  `/admin/news` (`NewsTable`, `NewsDialog`). A piece is published from `visibleFrom` up to and including `visibleTo`;
  without `visibleFrom` it is a draft. The server works out `published` from the dates, so nothing publishes it.
  News is plain text rendered through `PlainText`, and is deleted for real (its history stays).
- **Areas of responsibility (`Capability`) and guide item types are lists the super admin keeps** under Administration
  (`/admin/capabilities`, `/admin/guide-item-types`), not enums. Rows hold an entry's id (the four original ones keep
  `FINANCE`… and `TIP`…; new ones get a UUID) and GraphQL returns the entry, so show `name` with `catalogName` and
  never translate an id. Each item type has a fixed `kind` (`TIP | REQUIREMENT | QUESTION | TEXT`) that drives
  behaviour and styling (`GuideTypeBadge`, hiding `TEXT`); branch on `type.kind`, never on a type's id. Retired entries
  stay on rows that hold them; pickers offer `catalogChoices(active, held)`. Pages with a picker fetch the active list
  and wrap it in `CatalogProvider`.
- The server's plain HTTP endpoints (guide PDF, spex poster, budget export, receipts, Swish QR) go through
  `apiFetch` in `src/lib/api.server.ts`, which adds the token on the server. The browser reaches the PDF only through
  the route
  handler `/api/guide-pdf`, and a revival's poster only through `/api/revival-poster/[id]` (rendered by
  `RevivalPoster`, which falls back to a placeholder; never `next/image`, whose optimizer has no session).
  The budget's Excel export goes through `/api/budget-export/[id]` (language from the locale cookie), and receipts
  through `/api/receipts/[transactionId]`: GET downloads as a sandboxed attachment, POST checks the browser's
  multipart `file` (type and 10 MB, `receiptProblem`) and forwards it, DELETE removes it. A receipt chosen in the
  transaction dialog is uploaded right after the transaction is saved. `next.config.ts` sets the sandboxing CSP for
  the receipt, poster and Swish QR (`/api/swish-qr/[revivalId]`, an SVG) routes after the page policy, since the last
  matching header wins over the route's own, and
  raises `proxyClientMaxBodySize` because `proxy.ts` buffers request bodies.
- Calendar feeds are the exception: calendar apps have no session, so `/api/calendar/[file]` forwards
  `<token>.ics` (and `?lang=`) to the server with `apiFetchPublic`, without a token. The secret link is the credential;
  the web never stores it and shows it only once, right after `calendarFeedCreate`.
- **The guide** is read at `/guide` and `/revivals/[id]/guide` (the introduction and the chapters), one chapter at
  `/guide/[chapterKey]` and `/revivals/[id]/guide/[chapterKey]`, with search, the changes between versions
  (`/guide/changes`), suggestions and a PDF (`/api/guide-pdf`). Super admins edit and publish it under `/admin/guide`:
  the draft's chapters at `/admin/guide/draft`, each at `/admin/guide/draft/[chapterKey]`.
- **The decision log, meetings and checklists** are a revival's `/log` (filters in the URL), `/meetings` (a meeting in
  progress records what was done to each row; closed minutes can be emailed) and `/checklists` (one per chapter of
  the revival's guide version, and dated event checklists) tabs. Super admins keep checklist templates under
  `/admin/checklist-templates`. Nothing on them is deleted: rows are cancelled, items marked not applicable.
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
  elements the guide allows (paragraphs, lists, emphasis and links), so raw HTML stays text and images are never loaded. Guide text has a Swedish and an optional
  English version; pick with `pickText` from `src/components/guide/localized.ts`.
- Free text the steering group writes (log rows, comments, meeting notes, checklist items, owner names) is rendered
  only through `src/components/plain-text.tsx`: plain text with line breaks and linkified http (s) URLs, never Markdown
  or HTML.
- Mutations invalidate with `revalidatePath` (the revival's layout, or `/` for super admin lists). Server actions live
  in
  `src/app/(app)/<entity>/actions.server.ts` and validate input with the entity's Zod schema
  (`src/lib/<entity>/schema.ts`) before calling the lib.
- Codegen (`codegen.ts`) runs the client preset into `src/gql/` for typed `graphql()` documents, from the schema
  files of a sibling `fgv-revival-server` checkout. Fragment masking is off, and enums are string unions
  (`enumsAsTypes`).
- Errors carry `extensions.classification`: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` (also for revivals the
  caller may not see), `BAD_REQUEST`, `CONFLICT` (someone else changed it: ask to reload),
  `SPEXREGISTER_UNAVAILABLE` (show "temporarily unavailable", keep everything else working),
  `DIRECTORY_UNAVAILABLE` (the FGV accounts cannot be searched) and `MAIL_UNAVAILABLE`. `GraphQLRequestError` in
  `src/lib/graphql.server.ts` carries the code.
- Mutations send the `version` (or, for status, the `from` status) the user saw.

## Tables and forms

`@tanstack/react-table` v9 with React Compiler (`reactCompiler: true`). Three traps, all
previously hit in `spexregister-web`:

- `useTable()` returns a **new object on every state change**. Never put `table` in a `useEffect`
  dependency array — derive from state instead, as `src/components/data-table.client.tsx` does.
- Under React Compiler, a memoized cell reading live `row`/`table` methods off an otherwise stable
  object never updates. Pass primitives as props.

Forms use `react-hook-form` + `zodResolver`. Zod messages are keys under `Validation` in `messages/{sv,en}.json`,
translated where they are shown. The server checks the same rules; the schemas only give quicker feedback.

List pages follow one pattern, as in Spexregister: `DataTable` (`src/components/data-table.client.tsx`) with the
toolbar as its children — a search field, a `DataFilter` popover per kind, a reset button, actions on the right — and
a row menu (`MoreHorizontal`) instead of inline controls. The decision log keeps its filters in the URL and the server
filters; other lists filter on the client.

## Dates

Dates and times are always shown as `yyyy-mm-dd` and `yyyy-mm-dd hh:mm` (Swedish time), in both languages, as in
Spexregister: use `formatDate` / `formatInstant` from `src/utils/format.ts`, never `Intl` date styles. Date fields use
`DateInput` (`src/components/date-input.client.tsx`), not `<input type="date">`, whose format follows the browser.

Amounts are the server's `Amount` scalar, a decimal string ("1200", "1200.50"), never a float. Show them with
`formatAmount` (`src/utils/format.ts`): Swedish style in both languages, "12 345,50 kr", whole kronor without
decimals. Amount fields are text inputs read by `parseAmount` (`src/lib/budget/amount.ts`) through the budget schemas,
which accept "1 200,50" as well as "1200.50"; fill them back with `amountInputValue`.

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
`member-capabilities` (`count`), `member-remove`, `event-create` (`typed`), `calendar-link`, `budget-export`,
`transaction-create` (`receipt`), `participant-add` (`count`, `pending`), `participants-invite` (`count`),
`participation-respond` (`response`), `referral-create`, `availability-set` (`days` count), `shift-sign-up`,
`shift-assign` (`answer`), `mailing-draft` (`audience`), `mailing-send` (`audience`, `count`), `material-create`
(`category`, `recognised`), `inventory-create` (`kind`), `membership-set` (`count`), `sync-start` (`participants`),
`revival-anonymize`, `command-palette`,
`language-change` and `theme-change`.

## Testing

- Unit: Vitest, tests in `__tests__/` beside the code.
- E2E: Playwright against a real `next build && next start` on port 3100, with
  `e2e/mock-backend.mjs` standing in for the backend on 4100, one spec per user story (wired through `API_*` env in
  `playwright.config.ts`). The same mock also acts as a **mini-Keycloak** (discovery, authorize,
  token, JWKS, userinfo, logout), and `e2e/auth.setup.ts` signs in through a real OIDC
  authorization-code round-trip before saving `storageState`. Better Auth's cookies are encrypted
  blobs with no public minting API, so this is the supported way — don't try to forge them.
- Cache Components keeps recently visited routes mounted but hidden (React `<Activity>`), so after a navigation
  `getByLabel` can find a field twice; role queries skip hidden elements.
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
