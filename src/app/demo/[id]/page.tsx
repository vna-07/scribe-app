import { notFound } from "next/navigation";
import { loadDemoData } from "@/lib/demo-data";
import DemoDashboard from "./DemoDashboard";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDemoData(id);
  
  // Adding 'return' here helps TypeScript know data will never be null below
  if (!data) return notFound(); 
  
  return <DemoDashboard initialData={data} />;
}