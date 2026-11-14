import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SqlWorkspace } from "@/components/sql/SqlWorkspace";
import { sqlById, sqlProblems } from "@/lib/content/sql";

export const dynamicParams = false;
export const generateStaticParams = () => sqlProblems.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: sqlById.get(id)?.title ?? "SQL" };
}

export default async function SqlProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = sqlById.get(id);
  if (!problem) notFound();
  return <SqlWorkspace key={problem.id} problem={problem} />;
}
