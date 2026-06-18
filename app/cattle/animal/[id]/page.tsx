import { AnimalExpenses } from "@/components/cattle/animal-expenses"

export default async function AnimalExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AnimalExpenses animalId={id} />
}
