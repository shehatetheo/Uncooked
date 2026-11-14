import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/problem/Workspace";
import { problemById, problems, remixesOf } from "@/lib/content/problems";

export const dynamicParams = false;
export const generateStaticParams = () => problems.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: problemById.get(id)?.title ?? "Problem" };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = problemById.get(id);
  if (!problem) notFound();
  const remixes = remixesOf(id).map((r) => ({ id: r.id, title: r.title }));
  return <Workspace key={problem.id} problem={problem} remixes={remixes} />;
}
