import Link from "next/link";
import { TeacherAvailabilityForm } from "@/components/masters/teacher-availability-form";
import { actionError, backend, listBackend } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type { TeacherAvailability } from "@/lib/teacher-availability";

type Teacher = {
  id: number;
  name: string;
  employeeCode: string | null;
  external: boolean;
};

type Period = {
  id: number;
  name: string;
  academicYearName: string;
  startsOn: string;
  endsOn: string;
};

export const metadata = { title: "Jadwal Guru — Academy" };

export default async function TeacherSchedulesPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<{
    teacherId?: string | string[];
    academicPeriodId?: string | string[];
  }>;
}) {
  const { schoolId } = await params;
  const { school, canManage } = await getWorkspace(schoolId);
  const { teacherId, academicPeriodId } = await searchParams;
  const schoolPath = `/schools/${school.id}`;
  const path = `${schoolPath}/teacher-schedules`;
  let teachers: Teacher[];
  let periods: Period[];
  try {
    [teachers, periods] = await Promise.all([
      listBackend<Teacher>("/v1/teachers", school.id),
      listBackend<Period>("/v1/academic-periods", school.id),
    ]);
  } catch (error) {
    return (
      <section id="master-content" className="empty-state">
        <h1>Jadwal Guru belum bisa dimuat.</h1>
        <p>{actionError(error)}</p>
        <Link href={path}>Coba lagi</Link>
      </section>
    );
  }

  const teacher =
    teachers.find((row) => String(row.id) === teacherId) ??
    teachers.find((row) => row.external) ??
    teachers[0];
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: school.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const period =
    periods.find((row) => String(row.id) === academicPeriodId) ??
    periods.find((row) => row.startsOn <= today && today <= row.endsOn) ??
    periods[0];

  return (
    <section id="master-content">
      <div className="year-heading">
        <div>
          <h1>
            Jadwal Guru<span>.</span>
          </h1>
          <p>
            Atur slot mingguan yang bisa diajar guru luar pada tiap semester.
          </p>
        </div>
      </div>

      {!teacher ? (
        <div className="empty-state">
          <p>Tambahkan guru ke master untuk mulai mengatur jadwalnya.</p>
          <Link href={`${schoolPath}/teachers`}>Buka Master Guru</Link>
        </div>
      ) : !period ? (
        <div className="empty-state">
          <p>Tambahkan semester untuk mulai mengatur jadwal guru.</p>
          <Link href={`${schoolPath}/academic-periods`}>
            Buka Periode / semester
          </Link>
        </div>
      ) : (
        <>
          <form className="year-filters master-filters" action={path}>
            <label>
              <span id="teacher-schedule-teacher-label">Guru</span>
              <select
                aria-labelledby="teacher-schedule-teacher-label"
                name="teacherId"
                defaultValue={teacher.id}
                key={teacher.id}
              >
                {teachers.map((row) => (
                  <option key={row.id} value={row.id}>
                    {[
                      row.employeeCode,
                      row.name,
                      row.external ? "Guru luar" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span id="teacher-schedule-period-label">Semester</span>
              <select
                aria-labelledby="teacher-schedule-period-label"
                name="academicPeriodId"
                defaultValue={period.id}
                key={period.id}
              >
                {periods.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.academicYearName} · {row.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button-secondary">Tampilkan</button>
          </form>
          {teacher.external ? (
            <>
              <div className="year-section-title">
                <div>
                  <h2>{teacher.name}</h2>
                  <p>{period.name}</p>
                </div>
              </div>
              <ExternalTeacherSlots
                schoolId={school.id}
                teacherId={teacher.id}
                periodId={period.id}
                canManage={canManage}
              />
            </>
          ) : (
            <div className="empty-state">
              <p>
                {teacher.name} adalah guru internal dan tersedia di semua slot
                pelajaran selama tidak bentrok.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

async function ExternalTeacherSlots({
  schoolId,
  teacherId,
  periodId,
  canManage,
}: {
  schoolId: number;
  teacherId: number;
  periodId: number;
  canManage: boolean;
}) {
  let data;
  try {
    data = (
      await backend<TeacherAvailability>(
        `/v1/teachers/${teacherId}/availability?academicPeriodId=${periodId}`,
        {},
        schoolId,
      )
    ).result;
  } catch (error) {
    return (
      <p className="form-error" role="alert">
        {actionError(error)}
      </p>
    );
  }

  if (!data.slots.length) {
    return (
      <div className="empty-state">
        <p>Belum ada slot pelajaran untuk tahun ajaran ini.</p>
        <Link
          href={`/schools/${schoolId}/time-slots?academicYearId=${data.academicYearId}`}
        >
          Buka Slot waktu
        </Link>
      </div>
    );
  }

  return (
    <TeacherAvailabilityForm
      key={`${teacherId}:${periodId}`}
      schoolId={schoolId}
      teacherId={teacherId}
      periodId={periodId}
      data={data}
      canManage={canManage}
    />
  );
}
