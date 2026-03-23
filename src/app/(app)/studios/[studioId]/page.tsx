import { redirect } from "next/navigation"

export default async function StudioPage({ params }: { params: Promise<{ studioId: string }> }) {
  const { studioId } = await params
  redirect(`/studios/${studioId}/workspace`)
}
