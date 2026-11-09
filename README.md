# Academy frontend

Next.js App Router frontend using the selected **B / minimal modern** design, connected to Spring Boot for login, school selection/creation, and nine academic master screens.

## Run locally

Use Node.js 20.9+ (22 LTS recommended). Start PostgreSQL and the Java 21 backend from the sibling `academy-system-be` root:

```sh
docker compose up -d --wait
mvn verify
java -jar service/academy-app/target/academy-app-1.0.0-SNAPSHOT.jar
```

Run from the backend root so its ignored `application-local.yml` loads. Configure the first admin with `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD`, optional `BOOTSTRAP_ADMIN_EMAIL`, or `academy.bootstrap.platform-admin` in that YAML. Bootstrap creates missing accounts; changing its password does not reset an existing account.

In this frontend repository:

```sh
npm ci
# Optional: copy .env.example to .env.local and adjust backend address
npm run dev
```

Open http://localhost:3000. Login, choose/create a school, then manage academic years. Local integration checks leave one example school and year.

`ACADEMY_API_URL` defaults to `http://127.0.0.1:8081/api` and is server-only. Next.js forwards bearer tokens and selected school context; the browser does not call Spring directly. Cookies are HttpOnly, SameSite=Lax, and Secure in production. Use HTTPS in production. For HTTP-only local `npm start`, explicitly set `SESSION_COOKIE_SECURE=false` in ignored `.env.local`. Logout deletes the cookie; refresh and server revocation are not yet implemented.

## First master

- Create/edit a year with code, name, dates, duration of one JP in minutes (default 45), and optional active status.
- Search code/name, filter status, and paginate backend records.
- Activate another year to automatically deactivate the previous one.
- Duplicate codes and invalid dates show errors while preserving values.
- Delete an inactive, unused year after confirmation. Active/referenced years are protected.
- School admins/schedulers can write; teachers/viewers see a read-only interface. Backend authorization applies to every request.

## Academic masters

The sidebar provides year, period/semester, major, subject, teacher, class group, facility, room, and time-slot management. Every screen supports real CRUD, search, pagination, validation, school isolation, and role-based actions. Periods/classes/slots filter by year; classes also filter by major; teachers by active status; slots by day.

Create a year and major before a class. Period dates must fit within their year. Rooms can select multiple school facilities using checkboxes. The main **Slot waktu** screen selects one year/day and loads all its slots. Set the first start once; subsequent slots automatically continue from the previous end and sequence + 1. Add lesson JP using the year's duration, or breaks/activities by minutes. Drag the handle (pointer/touch), use arrow keys, or use the up/down buttons to reorder. Review the preview and click **Simpan susunan**; **Batal** restores the loaded plan. Names and non-lesson durations can be edited, and removals remain a draft until saved. All saves renumber the remaining slots and close gaps. Referenced slots cannot be moved or deleted. Revision checks reject stale tabs without overwriting newer changes. The advanced CRUD table is available through `?view=table`. Referenced records are protected against deletion and incompatible relationship changes.

The **Kebutuhan mapel** page configures a class/semester/subject and one positive **Target JP per minggu**. For example, enter 3 JP/week; scheduling can later place this as 3 JP together or 2 JP + 1 JP. JP targets belong to each class/semester requirement so the same subject can be reused with different targets. Filter by class, semester, or subject; search also matches class/major names. Dropdowns show the academic year to distinguish classes and semesters. The backend rejects mismatched years, duplicates, cross-school records, and changes/deletions to requirements used by schedules. Empty prerequisites link to the relevant master, and read-only roles cannot mutate data. Migration V15 converts previous meeting rows to their weekly total, preserving existing records. A fulfillment view per schedule version will be added with scheduling.

Teacher qualifications, availability, annual curriculum templates, project/PKL blocks, and timetable generation remain future work. The separate `/preview` design explorer retains illustrative data for A/B/C comparison.

## Structure

```text
src/app/                       Server pages, layouts, loading/error boundaries
src/components/auth/           Login form
src/components/schools/        School creation
src/components/workspace/      Minimal modern application shell
src/components/academic-years/ List and create/edit/delete dialogs
src/components/masters/        Shared server page, table, controlled form and delete dialog
src/lib/masters/configs/        One typed field/column configuration per master
src/lib/masters/registry.ts     Server-only action allowlist
src/components/ui/             Shared UI primitives
src/lib/backend.ts             Server-only API client and identity lookups
src/lib/actions/               Validated server actions
src/lib/workspace.ts           School access lookup
src/lib/api-types.ts           API contracts and display permissions
src/components/preview/        Separate mock explorer
src/styles/application.css     Live application styling
```

Server pages fetch private records without caching. Client components handle dialogs/navigation; mutations run in server actions. Actions resolve a server-owned config allowlist, verify school access, validate fields, then call the authorized backend. Form values survive validation errors. Lookups paginate all available records rather than truncating choices. CSS variables, responsive layouts, and Lucide icons keep components reusable. Fonts have system fallbacks.

## Validate

```sh
npm run typecheck
npm run format:check
npm run build
```

Backend `mvn verify` runs disposable PostgreSQL integration tests with Docker. Local browser checks exercise login, school creation, CRUD, persistence, validation, search, mobile layout, logout, and invalid sessions.
