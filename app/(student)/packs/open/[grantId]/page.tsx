import { PackOpenFlow } from "@/components/packs/PackOpenFlow";

export default async function PackOpenPage({
  params,
}: {
  params: Promise<{ grantId: string }>;
}) {
  const { grantId } = await params;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <PackOpenFlow grantId={grantId} />
    </div>
  );
}
