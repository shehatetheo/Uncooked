import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { problemById, problems } from "@content/index";
import { Workspace } from "@/components/Workspace";

export const generateStaticParams = () => problems.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: problemById.get(id)?.title ?? "Not found" };
}

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!problemById.has(id)) notFound();
  // keyed so picking another question starts a clean interview
  return <Workspace key={id} problemId={id} />;
}
