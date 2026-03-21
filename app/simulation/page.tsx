import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth';
import SceneSelector from '@/components/SceneSelector';
import Link from 'next/link';

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
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
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
      <main className="mx-auto max-w-6xl px-4 py-8 pb-32">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">选择推演场景</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            选择一个人生场景，让你的 Agent 分身开始推演。每条路都有不同的风景。
          </p>
        </div>

        {/* Scene Selector */}
        <SceneSelector />

        {/* How it works */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-4 text-3xl">🎯</div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">选择场景</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              从高考志愿到职业选择，从创业之路到思想碰撞。选择你想体验的人生阶段。
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-4 text-3xl">🤖</div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">AI 自主推演</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              你的 Agent 分身会与历史人物、其他用户 Agent 自主交互，产生意外对话。
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-4 text-3xl">📊</div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">获得洞察</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              推演结束后，你会获得一份详细的人生洞察报告，了解你的决策模式和成长轨迹。
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 rounded-2xl border border-zinc-200 bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:border-zinc-700 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">🎭 A2A 核心特色</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                1
              </span>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Agent 自主交互</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  不是预设脚本，是真正的 A2A 对话，你的 Agent 会自主学习和成长
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                2
              </span>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">随时回档重试</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  关键决策点可以存档，尝试不同选择，体验平行人生
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                3
              </span>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">人生图谱可视化</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  可视化所有分支路径，直观展示不同选择的人生轨迹
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                4
              </span>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">历史人物对话</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  与孔子、苏格拉底、马斯克等历史人物 Agent 深度对话
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
