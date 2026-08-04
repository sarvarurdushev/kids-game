import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getPackShop, getPackInventory } from "@/lib/student/packs";
import { Card } from "@/components/ui/Card";
import { PackCard } from "@/components/cards/PackCard";
import { BuyPackButton } from "@/components/packs/BuyPackButton";
import { BoosterPackIcon, CoinIcon } from "@/components/icons";
import { T } from "@/components/i18n/T";

const PACK_TYPE_COLOR: Record<string, string> = {
  attendance_pack: "var(--color-teal)",
  participation_pack: "var(--color-gk-coral)",
  discovery_pack: "var(--color-universe-space)",
  story_pack: "var(--color-universe-culture)",
  achievement_pack: "var(--color-rarity-legendary)",
};

export default async function PacksPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const [shop, inventory] = await Promise.all([
    getPackShop(student.coinsBalance),
    getPackInventory(student.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">
          <T k="packs.title" />
        </h1>
        <p className="flex items-center gap-1 text-ink/60">
          <CoinIcon size={18} /> {student.coinsBalance} <T k="home.coins" />
        </p>
      </div>

      {inventory.length > 0 && (
        <section>
          <h2 className="font-display mb-2 text-lg font-semibold">
            <T k="packs.readyToOpen" />
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {inventory.map((grant) => (
              <Link key={grant.id} href={`/packs/open/${grant.id}`}>
                <Card className="gk-pop-in flex flex-col items-center gap-2 text-center transition-transform active:scale-95">
                  <BoosterPackIcon size={64} color={PACK_TYPE_COLOR[grant.packType.key]} />
                  <span className="font-display font-semibold">{grant.packType.name}</span>
                  <span className="text-xs font-bold text-coral">
                    <T k="packs.tapToOpen" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display mb-2 text-lg font-semibold">
          <T k="packs.shopTitle" />
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shop.map((pack) => (
            <Card key={pack.id} className="flex flex-col items-center gap-2">
              <PackCard
                name={pack.name}
                cardsPerPack={pack.cardsPerPack}
                color={PACK_TYPE_COLOR[pack.key]}
              />
              <p className="flex items-center gap-1 text-sm font-bold">
                <CoinIcon size={16} /> {pack.coinCost}
              </p>
              <BuyPackButton packTypeId={pack.id} affordable={pack.affordable} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
