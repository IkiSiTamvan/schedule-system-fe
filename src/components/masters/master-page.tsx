import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers3 } from "lucide-react";
import { backend, actionError } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type {
  MasterConfig,
  MasterRecord,
  MasterSearch,
} from "@/lib/masters/types";
import { MasterList } from "./master-list";

async function lookupOptions(
  endpoint: string,
  schoolId: number,
  labelKey = "name",
  valueKey = "id",
) {
  const options = [];
  for (let page = 0; ; page++) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await backend<MasterRecord[]>(
      `${endpoint}${separator}page=${page}&size=100`,
      {},
      schoolId,
    );
    options.push(
      ...response.result.map((row) => ({
        value: String(row[valueKey]),
        label: String(row[labelKey] ?? row.code ?? row.id),
      })),
    );
    if (page + 1 >= (response.metaData?.pageCount ?? 1)) break;
  }
  return options;
}

export async function MasterPage({
  params,
  searchParams,
  config,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<MasterSearch>;
  config: MasterConfig;
}) {
  const { schoolId } = await params;
  const { school, canManage } = await getWorkspace(schoolId);
  const search = await searchParams;
  const q = typeof search.q === "string" ? search.q.trim().slice(0, 100) : "";
  const rawPage = typeof search.page === "string" ? Number(search.page) : 0;
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const query = new URLSearchParams({ q, page: String(page), size: "10" });
  const filters = config.fields.filter(
    (field) => (field.lookup || field.filter) && field.type !== "multiselect",
  );
  for (const field of filters) {
    const value = search[field.name];
    if (
      typeof value === "string" &&
      ((field.lookup &&
        /^\d+$/.test(value) &&
        Number.isSafeInteger(Number(value)) &&
        Number(value) > 0) ||
        (field.options &&
          field.options.some((option) => option.value === value)))
    )
      query.set(field.name, value);
  }
  const hasActive = config.fields.some(
    (field) => field.name === "active" && field.type === "checkbox",
  );
  if (hasActive && (search.active === "true" || search.active === "false"))
    query.set("active", search.active);
  let data, fields;
  try {
    [data, fields] = await Promise.all([
      backend<MasterRecord[]>(`${config.endpoint}?${query}`, {}, school.id),
      Promise.all(
        config.fields.map(async (field) =>
          field.lookup
            ? {
                ...field,
                options: await lookupOptions(
                  field.lookup.endpoint,
                  school.id,
                  field.lookup.labelKey,
                  field.lookup.valueKey,
                ),
              }
            : field,
        ),
      ),
    ]);
  } catch (error) {
    const message = actionError(error);
    return (
      <section id="master-content" className="empty-state">
        <h1>{config.title} belum bisa dimuat.</h1>
        <p>{message}</p>
        <Link
          className="button button-secondary"
          href={`/schools/${school.id}/${config.slug}`}
        >
          Coba lagi
        </Link>
      </section>
    );
  }
  const pageCount = data.metaData?.pageCount ?? 0;
  if (page > 0 && page >= pageCount) {
    query.set("page", String(Math.max(0, pageCount - 1)));
    redirect(`/schools/${school.id}/${config.slug}?${query}`);
  }
  return (
    <section id="master-content">
      <div className="year-heading">
        <div>
          <p className="eyebrow">MASTER AKADEMIK</p>
          <h1>
            {config.title}
            <span>.</span>
          </h1>
          <p>{config.description}</p>
        </div>
        <span className="year-heading-icon">
          <Layers3 size={27} />
        </span>
      </div>
      <MasterList
        key={`${config.slug}:${school.id}`}
        config={{ ...config, fields }}
        schoolId={school.id}
        rows={data.result}
        canManage={canManage}
        query={Object.fromEntries(query)}
        page={page}
        pageCount={pageCount}
        total={data.metaData?.totalData ?? 0}
      />
    </section>
  );
}
