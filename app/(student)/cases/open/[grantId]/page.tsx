import { CharacterCaseOpenFlow } from "@/components/cases/CharacterCaseOpenFlow";

export default async function CaseOpenPage({
  params,
}: {
  params: Promise<{ grantId: string }>;
}) {
  const { grantId } = await params;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <CharacterCaseOpenFlow grantId={grantId} />
    </div>
  );
}
