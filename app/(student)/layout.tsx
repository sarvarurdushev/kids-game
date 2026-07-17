import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();
  if (!student) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
