import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { backend, actionError } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type { AcademicYear } from "@/lib/api-types";
import { AcademicYearList } from "@/components/academic-years/academic-year-list";

export const metadata = { title: "Tahun ajaran — Academy" };

export default async function AcademicYearsPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<{ q?: string; active?: string; page?: string }>;
}) {
  const { schoolId } = await params;
  const { school, canManage } = await getWorkspace(schoolId);
  const search = await searchParams;
  const q = typeof search.q === "string" ? search.q.trim().slice(0, 100) : "";
  const active =
    search.active === "true" || search.active === "false" ? search.active : "";
  const rawPage = Number(search.page ?? 0);
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const query = new URLSearchParams({ q, page: String(page), size: "10" });
  if (active) query.set("active", active);
  let data, current;
  try {
    [data, current] = await Promise.all([
      backend<AcademicYear[]>(`/v1/academic-years?${query}`, {}, school.id),
      backend<AcademicYear[]>(
        "/v1/academic-years?active=true&size=1",
        {},
        school.id,
      ),
    ]);
  } catch (error) {
    const message = actionError(error);
    return (
      <section className="empty-state">
        <h1>Data belum bisa dimuat.</h1>
        <p>{message}</p>
        <Link className="button button-secondary" href="/schools">
          Kembali ke sekolah
        </Link>
      </section>
    );
  }
  const pageCount = data.metaData?.pageCount ?? 0;
  if (page > 0 && page >= pageCount) {
    query.set("page", String(Math.max(0, pageCount - 1)));
    redirect(`?${query}`);
  }
  return (
    <section id="academic-year-content">
      <div className="year-heading">
        <div>
          <p className="eyebrow">MASTER AKADEMIK</p>
          <h1>
            Tahun ajaran<span>.</span>
          </h1>
          <p>Rapikan waktunya. Siapkan pembelajaran berikutnya.</p>
        </div>
        <span className="year-heading-icon">
          <CalendarDays size={27} />
        </span>
      </div>
      <AcademicYearList
        schoolId={school.id}
        years={data.result}
        current={current.result[0] ?? null}
        canManage={canManage}
        q={q}
        active={active}
        page={page}
        pageCount={pageCount}
        total={data.metaData?.totalData ?? 0}
      />
    </section>
  );
}
