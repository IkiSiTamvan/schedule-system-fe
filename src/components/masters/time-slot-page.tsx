import Link from "next/link";
import { backend, actionError } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type { AcademicYear } from "@/lib/api-types";
import type { MasterSearch } from "@/lib/masters/types";
import type { SlotDay } from "@/lib/time-slot-day";
import { TimeSlotDay } from "./time-slot-day";

export async function TimeSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<MasterSearch>;
}) {
  const { schoolId } = await params;
  const { school, canManage } = await getWorkspace(schoolId);
  const search = await searchParams;
  let years: AcademicYear[] = [],
    data: SlotDay | undefined,
    selected: AcademicYear | undefined;
  const day =
    typeof search.dayOfWeek === "string" && /^[1-7]$/.test(search.dayOfWeek)
      ? Number(search.dayOfWeek)
      : 1;
  try {
    for (let page = 0; ; page++) {
      const response = await backend<AcademicYear[]>(
        `/v1/academic-years?page=${page}&size=100`,
        {},
        school.id,
      );
      years.push(...response.result);
      if (page + 1 >= (response.metaData?.pageCount ?? 1)) break;
    }
    selected =
      years.find((year) => String(year.id) === search.academicYearId) ??
      years.find((year) => year.active) ??
      years[0];
    if (selected)
      data = (
        await backend<SlotDay>(
          `/v1/time-slots/day?academicYearId=${selected.id}&dayOfWeek=${day}`,
          {},
          school.id,
        )
      ).result;
  } catch (error) {
    return (
      <section className="empty-state">
        <h1>Slot waktu belum bisa dimuat.</h1>
        <p>{actionError(error)}</p>
        <Link href={`/schools/${school.id}/time-slots`}>Muat ulang</Link>
      </section>
    );
  }
  return (
    <section id="master-content">
      <div className="year-heading">
        <div>
          <p className="eyebrow">MASTER AKADEMIK</p>
          <h1>
            Slot waktu<span>.</span>
          </h1>
          <p>
            Atur jam mulai pertama. Slot berikutnya melanjutkan waktu dan urutan
            secara otomatis.
          </p>
        </div>
      </div>
      {!selected || !data ? (
        <div className="empty-state">
          <h2>Buat tahun ajaran terlebih dahulu.</h2>
          <Link href={`/schools/${school.id}/academic-years`}>
            Buka tahun ajaran
          </Link>
        </div>
      ) : (
        <>
          <form
            className="year-filters master-filters"
            action={`/schools/${school.id}/time-slots`}
          >
            <label>
              Tahun ajaran
              <select
                name="academicYearId"
                defaultValue={selected.id}
                key={selected.id}
              >
                {years.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hari
              <select name="dayOfWeek" defaultValue={day} key={day}>
                {[
                  "Senin",
                  "Selasa",
                  "Rabu",
                  "Kamis",
                  "Jumat",
                  "Sabtu",
                  "Minggu",
                ].map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button-secondary">Tampilkan</button>
          </form>
          <TimeSlotDay
            key={`${selected.id}:${day}`}
            schoolId={school.id}
            yearId={selected.id}
            day={day}
            lessonMinutes={selected.lessonDurationMinutes}
            data={data}
            canManage={canManage}
          />
          <p className="master-field-hint">
            <Link
              href={`/schools/${school.id}/time-slots?view=table&academicYearId=${selected.id}&dayOfWeek=${day}`}
            >
              Tampilan tabel lanjutan
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
