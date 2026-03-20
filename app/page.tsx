import { getAuthUrl, AUTH_COOKIES, type UserProfile } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUserFromCookie(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(AUTH_COOKIES.USER);
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

export default async function Home() {
  const user = await getUserFromCookie();
  const authUrl = getAuthUrl();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-md px-4">
        {/* Logo Area */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-black dark:text-white">
            人生推演引擎
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            用你的 Agent 分身，在虚拟世界里活一万次
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-800/50">
          {user ? (
            /* Logged In State */
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-zinc-400">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>

              <h2 className="mb-1 text-xl font-semibold text-black dark:text-white">
                {user.name}
              </h2>

              {user.aboutMe && (
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
                  {user.aboutMe}
                </p>
              )}

              <div className="mb-6 w-full rounded-lg bg-zinc-50 p-4 dark:bg-zinc-700/50">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">主页路由</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {user.originRoute || '未设置'}
                  </span>
                </div>
                {user.homepage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">主页</span>
                    <a
                      href={user.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      访问 →
                    </a>
                  </div>
                )}
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  退出登录
                </button>
              </form>
            </div>
          ) : (
            /* Logged Out State */
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 text-6xl">🎭</div>

              <h2 className="mb-2 text-xl font-semibold text-black dark:text-white">
                欢迎来到人生推演引擎
              </h2>

              <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
                登录后，你的 Agent 分身将开始推演人生
              </p>

              <a
                href={authUrl}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                使用 SecondMe 登录
              </a>

              <p className="mt-4 text-xs text-zinc-400">
                登录即表示你同意我们的服务条款
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-400">
          基于 SecondMe Agent 网络构建
        </p>
      </div>
    </div>
  );
}
