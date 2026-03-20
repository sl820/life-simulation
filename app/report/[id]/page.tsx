import { getSimulation } from '@/lib/simulation';
import { generateAnalysisReport } from '@/lib/analysis';
import ReportView from '@/components/ReportView';
import Link from 'next/link';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: Params) {
  const { id } = await params;
  const simulation = getSimulation(id);

  if (!simulation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">推演不存在</h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">找不到对应的推演记录</p>
          <Link
            href="/simulation"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            返回推演
          </Link>
        </div>
      </div>
    );
  }

  const report = generateAnalysisReport(simulation);

  return <ReportView report={report} simulationId={id} />;
}
