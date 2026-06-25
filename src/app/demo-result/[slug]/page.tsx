import { notFound } from "next/navigation";
import { getDemoCallBySlug } from "@/lib/demo-calls";
import { DemoResultClient } from "./demo-result-client";

export const dynamic = "force-dynamic";

export default async function DemoResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const call = await getDemoCallBySlug(slug);

  if (!call) {
    notFound();
  }

  return <DemoResultClient call={call} />;
}
