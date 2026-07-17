import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { BottomNav } from "@/components/nav/BottomNav";
import { SoundToggle } from "@/components/ui/SoundToggle";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();
  if (!student) redirect("/login");

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-gold/20 via-cream to-cream">
      <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-teal/15 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
      <SoundToggle className="fixed top-4 right-4 z-20" />
      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
