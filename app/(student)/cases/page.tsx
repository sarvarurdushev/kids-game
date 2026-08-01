import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getCaseShop, getCaseInventory } from "@/lib/student/avatarCases";
import { Card } from "@/components/ui/Card";
import { BuyCaseButton } from "@/components/cases/BuyCaseButton";
import { ChestIcon, CoinIcon } from "@/components/icons";

export default async function CasesPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const [shop, inventory] = await Promise.all([
    getCaseShop(student.coinsBalance),
    getCaseInventory(student.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">Character cases</h1>
        <p className="flex items-center gap-1 text-ink/60">
          <CoinIcon size={18} /> {student.coinsBalance} coins
        </p>
      </div>

      {inventory.length > 0 && (
        <section>
          <h2 className="font-display mb-2 text-lg font-semibold">Ready to open</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {inventory.map((grant) => (
              <Link key={grant.id} href={`/cases/open/${grant.id}`}>
                <Card className="gk-pop-in flex flex-col items-center gap-2 text-center transition-transform active:scale-95">
                  <ChestIcon size={64} />
                  <span className="font-display font-semibold">{grant.caseType.name}</span>
                  <span className="text-xs font-bold text-coral">Tap to open!</span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display mb-2 text-lg font-semibold">Case shop</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shop.map((caseType) => (
            <Card key={caseType.id} className="flex flex-col items-center gap-2">
              <ChestIcon size={64} />
              <span className="font-display text-center font-semibold">{caseType.name}</span>
              <p className="flex items-center gap-1 text-sm font-bold">
                <CoinIcon size={16} /> {caseType.coinCost}
              </p>
              <BuyCaseButton caseTypeId={caseType.id} affordable={caseType.affordable} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
