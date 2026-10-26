import { getWorkspace } from "@/lib/workspace";
import { AppShell } from "@/components/workspace/app-shell";

export default async function SchoolLayout({
  params,
  children,
}: {
  params: Promise<{ schoolId: string }>;
  children: React.ReactNode;
}) {
  const { schoolId } = await params;
  const { user, school } = await getWorkspace(schoolId);
  return (
    <AppShell user={user} school={school}>
      {children}
    </AppShell>
  );
}
