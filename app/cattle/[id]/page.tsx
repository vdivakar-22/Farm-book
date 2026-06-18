import { CattleDetail } from "@/components/cattle/cattle-detail"

export default async function CattleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CattleDetail typeId={id} />
}
