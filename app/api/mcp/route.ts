import { NextRequest, NextResponse } from 'next/server';

// MCP JSON-RPC endpoint
// Handles tool calls from SecondMe platform

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
    authorization?: string;
  };
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Available tools registry
const tools: Tool[] = [
  {
    name: 'start_life_simulation',
    description: '为用户启动人生推演引擎',
    inputSchema: {
      type: 'object',
      properties: {
        scene_id: { type: 'string', description: '场景ID' },
        time_speed: { type: 'number', description: '时间加速比', default: 365 },
      },
      required: ['scene_id'],
    },
  },
  {
    name: 'consult_historical_figure',
    description: '让用户Agent与历史人物Agent进行A2A对话',
    inputSchema: {
      type: 'object',
      properties: {
        figure_id: { type: 'string', description: '历史人物ID' },
        topic: { type: 'string', description: '讨论话题' },
      },
      required: ['figure_id'],
    },
  },
  {
    name: 'make_decision',
    description: '在决策点做出选择',
    inputSchema: {
      type: 'object',
      properties: {
        simulation_id: { type: 'string', description: '推演ID' },
        decision_id: { type: 'string', description: '决策点ID' },
        choice: { type: 'string', description: '选择ID' },
      },
      required: ['simulation_id', 'decision_id', 'choice'],
    },
  },
  {
    name: 'rollback_to_checkpoint',
    description: '回档到指定存档点',
    inputSchema: {
      type: 'object',
      properties: {
        simulation_id: { type: 'string', description: '推演ID' },
        checkpoint_id: { type: 'string', description: '存档ID' },
      },
      required: ['simulation_id', 'checkpoint_id'],
    },
  },
  {
    name: 'get_analysis_report',
    description: '获取分析报告（包含交互式可视化）',
    inputSchema: {
      type: 'object',
      properties: {
        simulation_id: { type: 'string', description: '推演ID' },
        format: { type: 'string', enum: ['interactive', 'summary'], default: 'interactive' },
      },
      required: ['simulation_id'],
    },
  },
  {
    name: 'ask_insight',
    description: '向AI追问分析洞察',
    inputSchema: {
      type: 'object',
      properties: {
        simulation_id: { type: 'string', description: '推演ID' },
        question: { type: 'string', description: '问题' },
      },
      required: ['simulation_id', 'question'],
    },
  },
  {
    name: 'list_scenes',
    description: '列出所有可用的推演场景',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_historical_figures',
    description: '列出所有可用的历史人物Agent',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Tool handlers
async function handleToolCall(method: string, params?: Record<string, unknown>, auth?: string) {
  switch (method) {
    case 'tools/list': {
      return { tools };
    }

    case 'tools/call': {
      const { name, arguments: args } = params as { name: string; arguments?: Record<string, unknown> };

      if (!name) {
        throw new Error('Missing tool name');
      }

      // Validate auth token (in production, verify with SecondMe)
      if (!auth && name !== 'list_scenes' && name !== 'list_historical_figures') {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: 'Unauthorized: Bearer token required' }),
            },
          ],
        };
      }

      switch (name) {
        case 'start_life_simulation': {
          const { scene_id, time_speed } = args as { scene_id?: string; time_speed?: number };
          if (!scene_id) throw new Error('scene_id is required');

          // Call simulation API
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/simulation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sceneId: scene_id, config: { speed: time_speed || 365 } }),
          });

          const data = await res.json();
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(data) }],
          };
        }

        case 'consult_historical_figure': {
          const { figure_id, topic } = args as { figure_id?: string; topic?: string };
          if (!figure_id) throw new Error('figure_id is required');

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  message: `已连接到 ${figure_id}，讨论话题：${topic || '人生哲学'}`,
                  conversation_id: `conv-${Date.now()}`,
                }),
              },
            ],
          };
        }

        case 'list_scenes': {
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scenes`);
          const data = await res.json();
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(data) }],
          };
        }

        case 'list_historical_figures': {
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/a2a/agents?type=historical`);
          const data = await res.json();
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(data) }],
          };
        }

        case 'get_analysis_report': {
          const { simulation_id, format } = args as { simulation_id?: string; format?: string };
          if (!simulation_id) throw new Error('simulation_id is required');

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  simulation_id,
                  format: format || 'interactive',
                  report_url: `/report/${simulation_id}`,
                  status: 'completed',
                }),
              },
            ],
          };
        }

        case 'ask_insight': {
          const { simulation_id, question } = args as { simulation_id?: string; question?: string };
          if (!simulation_id || !question) throw new Error('simulation_id and question are required');

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  answer: `基于你的推演数据，关于"${question}"的分析：这是一个值得深思的问题...`,
                  simulation_id,
                }),
              },
            ],
          };
        }

        case 'make_decision': {
          const { simulation_id, decision_id, choice } = args as { simulation_id?: string; decision_id?: string; choice?: string };
          if (!simulation_id || !decision_id || !choice) throw new Error('simulation_id, decision_id and choice are required');

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  decision_id,
                  choice,
                  outcome: '正在处理你的选择...',
                }),
              },
            ],
          };
        }

        case 'rollback_to_checkpoint': {
          const { simulation_id, checkpoint_id } = args as { simulation_id?: string; checkpoint_id?: string };
          if (!simulation_id || !checkpoint_id) throw new Error('simulation_id and checkpoint_id are required');

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  success: true,
                  message: `已回档到存档点 ${checkpoint_id}`,
                  simulation_id,
                }),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }

    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MCPRequest = await request.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        { jsonrpc: '2.0', id: id || 1, error: { code: -32600, message: 'Invalid Request' } },
        { status: 400 }
      );
    }

    // Extract authorization header
    const auth = request.headers.get('Authorization')?.replace('Bearer ', '');

    const result = await handleToolCall(method, params?.arguments, auth);

    return NextResponse.json({
      jsonrpc: '2.0',
      id: id || 1,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32603, message },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return available tools info
  return NextResponse.json({
    name: '人生推演引擎 MCP',
    version: '1.0.0',
    description: '人生推演引擎的MCP工具接口',
    tools: tools.map((t) => ({ name: t.name, description: t.description })),
  });
}
