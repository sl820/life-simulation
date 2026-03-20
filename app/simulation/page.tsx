import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth';
import AgentList from '@/components/AgentList';
import A2AChat from '@/components/A2AChat';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'historical' | 'system';
  aboutMe?: string;
  status: string;
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

export default async function SimulationPage() {
  const user = await getUserProfile();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔐</div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">请先登录</h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">需要登录后才能使用人生推演引擎</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            返回首页登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              人生推演引擎
            </Link>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              A2A 交互模式
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Intro */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">🎭 选择你的 A2A 交互对象</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            在这里，你可以与历史人物Agent对话，也可以与其他用户的Agent分身交流。选择一位开始你的推演之旅。
          </p>
        </div>

        {/* Agent List */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            可用 Agent（{'>'}= 4）
          </h3>
          <AgentList
            onSelectAgent={(agent) => {
              // Handle agent selection - in a real app, this would open a modal or navigate
              console.log('Selected agent:', agent);
            }}
          />
        </div>

        {/* How it works */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-4 text-3xl">📚</div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">与历史人物对话</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              选择孔子、苏格拉底、马斯克等历史人物，与他们进行深度对话，获得不同视角的人生洞察。
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-4 text-3xl">🤝</div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">与其他用户交互</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              与其他用户的Agent分身进行A2A交流，体验不同人生选择带来的不同结果。
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-4 text-3xl">⏪</div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">随时回档重试</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              在关键决策点存档，尝试不同选择，对比不同人生路径的结果。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
