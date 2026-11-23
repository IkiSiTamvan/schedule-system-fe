import Link from "next/link";
import { ClassScheduleBoard } from "@/components/masters/class-schedule-board";
import { ScheduleDraftForm } from "@/components/masters/class-schedule-forms";
import styles from "@/components/masters/class-schedule.module.css";
import { actionError, ApiError, backend, listBackend } from "@/lib/backend";
import {
  schedulePath,
  type ExternalTeacherAvailability,
  type ScheduleClass,
  type ScheduleEntry,
  type SchedulePeriod,
  type ScheduleRequirement,
  type ScheduleRoom,
  type ScheduleSlot,
  type ScheduleTeacher,
  type ScheduleVersion,
} from "@/lib/class-schedule";
import { getWorkspace } from "@/lib/workspace";

export const metadata = { title: "Jadwal Kelas — Academy" };

type Filters = {
  academicPeriodId?: string | string[];
  versionId?: string | string[];
  classGroupId?: string | string[];
};

const statusLabel = { DRAFT: "Draft", PUBLISHED: "Terbit", ARCHIVED: "Arsip" };

export default async function ClassSchedulesPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<Filters>;
}) {
  const { schoolId } = await params;
  const { school, canManage } = await getWorkspace(schoolId);
  return (
    <section id="master-content">
      <div className="year-heading">
        <div>
          <h1>
            Jadwal Kelas<span>.</span>
          </h1>
          <p>Susun pertemuan mingguan dan cek pemenuhan JP tiap kelas.</p>
        </div>
      </div>
      {canManage ? (
        await renderSchedule(school.id, school.timeZone, await searchParams)
      ) : (
        <p className="empty-state">
          Jadwal kelas dapat dibuka oleh admin dan penyusun jadwal.
        </p>
      )}
    </section>
  );
}

async function renderSchedule(
  schoolId: number,
  timeZone: string,
  filters: Filters,
) {
  const path = schedulePath(schoolId);
  const schoolPath = "/schools/" + schoolId;
  try {
    const periods = await listBackend<SchedulePeriod>(
      "/v1/academic-periods",
      schoolId,
    );
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const period =
      periods.find((row) => String(row.id) === filters.academicPeriodId) ??
      periods.find((row) => row.startsOn <= today && today <= row.endsOn) ??
      periods[0];
    if (!period)
      return (
        <div className="empty-state">
          <p>Tambahkan semester untuk mulai menyusun jadwal.</p>
          <Link href={schoolPath + "/academic-periods"}>
            Buka Periode / semester
          </Link>
        </div>
      );

    const versionsPath = "/v1/schedule-versions";
    const [classGroups, versionsResponse] = await Promise.all([
      listBackend<ScheduleClass>("/v1/class-groups", schoolId, {
        academicYearId: period.academicYearId,
      }),
      backend<ScheduleVersion[]>(
        versionsPath + "?academicPeriodId=" + period.id,
        {},
        schoolId,
      ),
    ]);
    const versions = versionsResponse.result;
    const version =
      versions.find((row) => String(row.id) === filters.versionId) ??
      versions.find((row) => row.status === "DRAFT") ??
      versions[0];
    const group =
      classGroups.find((row) => String(row.id) === filters.classGroupId) ??
      classGroups[0];
    let board;
    if (version && group) {
      const versionPath = versionsPath + "/" + version.id;
      const [slots, entries, fulfillment, details, teachers, rooms] =
        await Promise.all([
          listBackend<ScheduleSlot>("/v1/time-slots", schoolId, {
            academicYearId: period.academicYearId,
          }),
          backend<ScheduleEntry[]>(versionPath + "/entries", {}, schoolId),
          backend<Omit<ScheduleRequirement, "requiresLab">[]>(
            versionPath + "/fulfillment?classGroupId=" + group.id,
            {},
            schoolId,
          ),
          listBackend<{ id: number; requiresLab: boolean }>(
            "/v1/class-subject-requirements",
            schoolId,
            { classGroupId: group.id, academicPeriodId: period.id },
          ),
          listBackend<ScheduleTeacher>("/v1/teachers", schoolId),
          listBackend<ScheduleRoom>("/v1/rooms", schoolId),
        ]);
      const detailsById = new Map(details.map((row) => [row.id, row]));
      const requirements = fulfillment.result.map((row) => ({
        ...row,
        requiresLab: detailsById.get(row.requirementId)?.requiresLab ?? false,
      }));
      const availability =
        version.status === "DRAFT"
          ? await loadExternalAvailability(
              schoolId,
              period.id,
              teachers,
              requirements,
            )
          : {};
      board = (
        <ClassScheduleBoard
          key={[period.id, version.id, group.id].join(":")}
          schoolId={schoolId}
          version={version}
          group={group}
          classGroups={classGroups}
          slots={slots}
          entries={entries.result}
          requirements={requirements}
          teachers={teachers}
          availability={availability}
          rooms={rooms}
        />
      );
    }
    return (
      <>
        <div className="year-panel">
          <form
            className={"year-filters master-filters " + styles.filters}
            action={path}
            key={[period.id, version?.id, group?.id].join(":")}
          >
            <label>
              <span>Semester</span>
              <select name="academicPeriodId" defaultValue={period.id}>
                {periods.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name} · {row.academicYearName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Versi jadwal</span>
              <select
                name="versionId"
                defaultValue={version?.id ?? ""}
                disabled={!version}
              >
                {!version && <option value="">Belum ada versi</option>}
                {versions.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name} · {statusLabel[row.status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Kelas</span>
              <select
                name="classGroupId"
                defaultValue={group?.id ?? ""}
                disabled={!group}
              >
                {!group && <option value="">Belum ada kelas</option>}
                {classGroups.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button-secondary">Tampilkan</button>
          </form>
          {group && (
            <ScheduleDraftForm
              key={period.id + ":" + (version?.id ?? "new")}
              schoolId={schoolId}
              periodId={period.id}
              classId={group.id}
              initiallyOpen={!version}
            />
          )}
        </div>
        {!group ? (
          <div className="empty-state">
            <p>Belum ada kelas di tahun ajaran ini.</p>
            <Link
              href={
                schoolPath +
                "/class-groups?academicYearId=" +
                period.academicYearId
              }
            >
              Buka Master Kelas
            </Link>
          </div>
        ) : (
          (board ?? (
            <p className="empty-state">
              Buat draft untuk mulai mengisi jadwal {group.name}.
            </p>
          ))
        )}
      </>
    );
  } catch (error) {
    return (
      <div className="empty-state">
        <p className="form-error" role="alert">
          {actionError(error)}
        </p>
        <Link href={path}>Coba lagi</Link>
      </div>
    );
  }
}

async function loadExternalAvailability(
  schoolId: number,
  periodId: number,
  teachers: ScheduleTeacher[],
  requirements: ScheduleRequirement[],
) {
  const subjects = new Set(requirements.map((row) => row.subjectId));
  const candidates = teachers.filter(
    (teacher) =>
      teacher.active &&
      teacher.external &&
      teacher.subjectIds.some((id) => subjects.has(id)),
  );
  const availability: ExternalTeacherAvailability = {};
  const batchSize = 8;
  for (let start = 0; start < candidates.length; start += batchSize) {
    await Promise.all(
      candidates.slice(start, start + batchSize).map(async (teacher) => {
        try {
          const response = await backend<{ availableSlotIds: number[] }>(
            "/v1/teachers/" +
              teacher.id +
              "/availability?academicPeriodId=" +
              periodId,
            {},
            schoolId,
          );
          availability[teacher.id] = response.result.availableSlotIds;
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) throw error;
        }
      }),
    );
  }
  return availability;
}
