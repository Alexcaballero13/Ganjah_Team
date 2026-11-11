import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth-session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/ingreso");

  return <AppShell username={session.username} role={session.role}>{children}</AppShell>;
}
