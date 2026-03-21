import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth';
import { createSimulation, getSimulation } from '@/lib/simulation';
import { getSceneMetadata } from '@/lib/scenes';
import SimulationView from '@/components/SimulationView';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ sceneId: string }>;
}

interface UserProfile {
  name: string;
  avatar?: string;
  aboutMe?: string;
  originRoute?: string;
  homepage?: string;
}

async function getUserProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(AUTH_COOKIES.USER);
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

async function getOrCreateSimulation(userId: string, sceneId: string) {
  // For now, create a new simulation each time
  const simulation = createSimulation(userId, sceneId);
  return simulation;
}

export default async function SimulationPlayPage({ params }: PageProps) {
  const { sceneId } = await params;
  const user = await getUserProfile();

  if (!user) {
    redirect('/');
  }

  const sceneMeta = getSceneMetadata(sceneId);
  if (!sceneMeta) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">场景不存在</h1>
        <Link href="/simulation" className="mt-4 text-blue-600 hover:underline">
          返回场景选择
        </Link>
      </div>
    );
  }

  const userId = `user-${user.originRoute || user.name}`;
  const simulation = await getOrCreateSimulation(userId, sceneId);

  if (!simulation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">创建推演失败</h1>
        <Link href="/simulation" className="mt-4 text-blue-600 hover:underline">
          返回场景选择
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/simulation" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              ← 返回
            </Link>
            <div>
              <h1 className="font-bold text-zinc-900 dark:text-zinc-100">{sceneMeta.name}</h1>
              <p className="text-xs text-zinc-500">{sceneMeta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              🔄 运行中
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <SimulationView simulationId={simulation.id} />
      </main>
    </div>
  );
}
