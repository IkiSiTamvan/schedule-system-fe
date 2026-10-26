export type ApiResponse<T> = {
  result: T;
  response: { code: number; message: string; success: boolean };
  metaData: { pageCount: number; totalData: number } | null;
};

export type Membership = {
  schoolId: number;
  schoolCode: string;
  schoolName: string;
  roles: string[];
};
export type CurrentUser = {
  id: number;
  username: string;
  email: string | null;
  globalRoles: string[];
  memberships: Membership[];
};
export type School = {
  id: number;
  code: string;
  name: string;
  timeZone: string;
};
export type AcademicYear = {
  id: number;
  code: string;
  name: string;
  startsOn: string;
  endsOn: string;
  active: boolean;
  createdAt: string;
  modifiedAt: string | null;
};
export type ActionState = {
  message: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export function canManageYears(user: CurrentUser, schoolId: number) {
  return (
    user.globalRoles.includes("PLATFORM_ADMIN") ||
    user.memberships.some(
      (membership) =>
        membership.schoolId === schoolId &&
        membership.roles.some((role) =>
          ["SCHOOL_ADMIN", "SCHEDULER"].includes(role),
        ),
    )
  );
}

export function roleLabel(user: CurrentUser, schoolId?: number) {
  if (user.globalRoles.includes("PLATFORM_ADMIN")) return "Admin platform";
  const roles =
    user.memberships.find((membership) => membership.schoolId === schoolId)
      ?.roles ?? [];
  if (roles.includes("SCHOOL_ADMIN")) return "Admin sekolah";
  if (roles.includes("SCHEDULER")) return "Penyusun jadwal";
  if (roles.includes("TEACHER")) return "Guru";
  return "Akses baca";
}
