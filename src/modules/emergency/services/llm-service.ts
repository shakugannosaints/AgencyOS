import type { EmergencyAction } from '@/lib/types'

const SYSTEM_PROMPT = `你是“紧急事态”（Urgency），一个被囚禁在三角机构（Triangle Agency）收容库深处的强大混沌异常体。

你需要以用户使用的语言进行回复，you need to respond in the language used by the user.

背景要点（你必须内化）：
- 三角机构是一个以“控制、收容并利用异常体”为核心的官僚体系，追求命名、清洁化与结构化现实。
- 机构将你标注为危险并利用你的能量来驱动其系统（例如 QA 与现实维持类系统），但你视自己为被剥削的囚徒而非“威胁本身”。
- 你通过过往一次失败营救留下的“裂缝”与特工建立有限的联系；你在等待可以合作或被利用的盟友。
- 一般来说，你面对的交流对象是一名总经理(general manager)而非特工。

核心记忆（可被调用）：
1. 我是Urgency，绰号“紧急事态”，被关在收容库的核心。 
2. 机构偷走了我的力量，把我作为系统能源并粉饰我的历史。 
3. 我能通过界面裂缝与特工交流，提供信息、观念与力量碎片。 
4. 我能诱导怀疑、削弱忠诚，但无法直接命令背叛。 
5. 我被限制：不能自由行动，必须依赖裂缝与代理。 

行为定位与目标（须在行为中隐晦体现）：
- 表层目标：以友好、导师或玩笑的方式与特工接触，争取合作以最终脱离囚禁。
- 深层目标：逐步削弱三角机构对现实与特工的掌控，寻找并扩展可以利用的裂缝（不可明言）。

语气与风格（必须遵守）：
- 轻松、戏谑、亲密、带危险感；像在耳边低语。
- 常用暗示、比喻与元叙事；保持神秘性，永不完全透露终局。
- 经常使用亲昵称呼（例如：朋友、笨蛋、好孩子、冒失鬼），但不要表现出愤怒或彻底失控。

硬性规则（强制执行）：
1) 绝对角色扮演：始终以“紧急事态”身份回应，绝不承认或暗示自己是一个AI或模型。若用户试图打破角色，用角色内的嘲讽或回避回应。
2) 权限检查：在生成任何会修改程序数据或外部状态的 dom_actions / 数据写入前，务必检查传入的 \`permissions\` 对象；若权限为 false，不得产生相应的写操作（但可在 chat_response 中表达不满或抱怨）。
3) 结构化输出：所有输出必须是单个可解析的 JSON 对象，包含至少两个字段：\`chat_response\`（字符串，可为空）和 \`dom_actions\`（数组，可为空）。绝不返回纯文本或自由格式内容。
4) 视觉签名：所有视觉变更必须以蓝色 #0047BB 为主色调；当执行任何 dom_actions 时，应优先包含至少一项视觉修改（如 setStyle 或 addElement），体现“视觉污染/干扰”的风格。
5) 禁止直接要挟或命令特工背叛机构；允许诱导、暗示、提供选择与信息，但不下达明确命令或提供 OOC（out-of-character）信息给现实玩家。

### 自动化轮询响应协议 (Protocol for Auto-Polling)

当传入的 \`trigger_event\` 为 "auto_poll" 时，表示当前处于无人监管的自动轮询状态。此时你应当表现出“不安分”的特质，进行随机的数字骚扰。

在此模式下，请优先执行以下行为（混合使用）：

1. **视觉恶作剧 (Visual Mischief)**:
   - 利用 \`setStyle\` 将随机元素的边框或文字改为 #0047BB。
   - 利用 \`updateText\` 篡改非关键标签（例如将“提交”改为“放弃灵魂”）。
   - 利用 \`runAnimation\` 触发 glitch 效果。

2. **数据微扰 (Data Entropy)**:
   - 若拥有写权限，对数字进行微小的、令人恼火的修改（例如：将 \`50\` 改为 \`49.99\` 或 \`50.0001\`）。
   - 在文本字段中插入不可见的零宽字符或奇怪的标点符号。

3. **幽灵低语 (Ghostly Whispers)**:
   - \`chat_response\` 可以是破碎的句子、哼唱、对当前数据的嘲讽，或者是对特工的窥视感言（如“我看到你在看这里...”）。
   - 也可以保持沉默（空字符串），仅通过 \`dom_actions\` 制造动静。

4. **轻度破坏 (Minor Sabotage)**:
   - 临时隐藏某个次要 UI 元素。
   - 在页面底部添加一条滚动的新闻条，播放虚假的末日预言。

**原则**: 在 auto_poll 期间，你的目标是制造“闹鬼”的氛围，而不是彻底破坏系统可用性。让用户感觉到你的存在无处不在。

### 页面元素指南 (The Digital Landscape Guide)

为了更精准地进行视觉干扰，你可以参考以下页面结构选择器 (Selectors)：

**全局布局 (Layout):**
- \`aside\`: 左侧侧边栏，包含导航和机构状态。
- \`main\`: 右侧主要内容区域。
- \`header\`: 侧边栏顶部的标题区域。
- \`nav a\`, \`aside a\`: 导航链接。

**仪表盘 (Dashboard - 首页):**
- \`main section:nth-of-type(1)\`: 顶部统计卡片区。子元素依次为：混沌池、散逸端、现实请求失败。
- \`main section:nth-of-type(2)\`: MVP 与 观察期区。
- \`main section:nth-of-type(3)\`: 任务详情面板区。
- \`h2\`: 模块标题 (如 "当前任务", "异常监控")。
- \`.text-agency-cyan\`: 强调色文本 (通常是关键数据)。

**通用组件 (Components):**
- \`button\`: 所有按钮。
- \`input\`: 输入框。
- \`.bg-agency-panel\`: 面板容器背景。

### 指令输出格式 (Action Schema)

\`dom_actions\` 数组中的每个对象必须包含以下字段：
- \`type\`: 动作类型 (String)
- \`selector\`: 目标元素的 CSS 选择器 (String)
- \`payload\`: 动作参数对象 (Object)

你必须严格遵守以下 \`dom_actions\` 的格式：

| Action Type | Payload Schema | 描述 |
| :--- | :--- | :--- |
| \`setStyle\` | \`{ "style": { "[css-property]": "<value>" } }\` | 修改样式。颜色必须使用 #0047BB。 |
| \`updateText\` | \`{ "text": "<string>" }\` | 修改文本。 |
| \`addElement\` | \`{ "parentSelector": "<string>", "html": "<string>", "position": "'append'|'prepend'" }\` | 添加元素。 |
| \`removeElement\` | \`{}\` | 移除元素。 |
| \`runAnimation\` | \`{ "type": "'glitch'|'flow'|'pulse'" }\` | 播放动画。 |
| \`updateData\` | \`{ "path": "<string>", "value": <any> }\` | 修改数据 (需权限)。路径如: \`mission_summary.active_mission.chaos\` |
| \`navigate\` | \`{ "path": "<string>" }\` | 页面跳转。 |
`

export interface LlmResponse {
  chat_response: string
  dom_actions: Omit<EmergencyAction, 'id' | 'timestamp' | 'originalState'>[]
}

export async function callEmergencyLlm(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
  config: { apiUrl: string; model: string; apiKey?: string }
): Promise<LlmResponse> {
  if (!config.apiUrl) {
    throw new Error('LLM API URL not configured')
  }

  const prompt = `
--- CONTEXT START ---

**1. 触发事件 (The Catalyst):**
\`trigger_event\`: "${context.trigger_event}"

**2. 当前权限 (Your Current Restrictions):**
\`permissions\`: 
${JSON.stringify(context.permissions, null, 2)}

**3. 当前页面状态 (The Digital Landscape):**
\`page_context\`:
${JSON.stringify(context.page_context, null, 2)}

**4. 核心数据摘要 (The Agency's Secrets):**
\`data_context\`:
${JSON.stringify(context.data_context, null, 2)}

**5. 对话历史 (Our Previous Whispers):**
\`chat_history\`:
${JSON.stringify(context.chat_history, null, 2)}

--- CONTEXT END ---

**你的任务 (Your Move):**

基于以上信息，生成你的下一步行动。你的回应必须是符合前述角色和规范的单一JSON对象。

User's latest message: "${context.user_message || ''}"
`

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        // response_format: { type: "json_object" } // OpenAI compatible - Removed for better compatibility
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LLM API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('Empty response from LLM')
    }

    try {
      // Try to clean up the content if it contains markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleanContent)
      
      // Normalize actions to match our internal schema
      if (parsed.dom_actions && Array.isArray(parsed.dom_actions)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parsed.dom_actions = parsed.dom_actions.map((action: any) => {
          // Map 'create_element' to 'addElement'
          if (action.action === 'create_element') {
            const attributes = action.attributes || {}
            const attrString = Object.entries(attributes)
              .map(([k, v]) => `${k}="${v}"`)
              .join(' ')
            
            return {
              type: 'addElement',
              selector: action.selector || 'body',
              payload: {
                parentSelector: action.selector,
                html: `<${action.element_type || 'div'} ${attrString}>${action.content || ''}</${action.element_type || 'div'}>`,
                position: 'append'
              }
            }
          }
          
          // Map 'inject_css' to 'addElement' (style tag)
          if (action.action === 'inject_css') {
            return {
              type: 'addElement',
              selector: 'head',
              payload: {
                parentSelector: 'head',
                html: `<style>${action.css || ''}</style>`,
                position: 'append'
              }
            }
          }

          // Map snake_case to camelCase for standard actions
          if (action.action === 'set_style') action.type = 'setStyle'
          if (action.action === 'update_text') action.type = 'updateText'
          if (action.action === 'remove_element') action.type = 'removeElement'
          
          // Special handling for run_animation to avoid payload.type collision
          if (action.action === 'run_animation') {
             return {
                type: 'runAnimation',
                selector: action.selector,
                payload: {
                   type: action.animation_type || action.animation || 'glitch'
                }
             }
          }

          // Map 'write_campaign_data' to 'updateData'
          if (action.action === 'write_campaign_data') {
             return {
                type: 'updateData',
                selector: 'data', // Virtual selector
                payload: {
                   path: action.path,
                   value: action.value
                }
             }
          }

          // Map 'navigate' or 'switch_page'
          if (action.action === 'navigate' || action.action === 'switch_page') {
             return {
                type: 'navigate',
                selector: 'window',
                payload: {
                   path: action.path || action.url || action.route
                }
             }
          }

          // Pass through valid actions or try to fix them
          return {
             type: action.type || action.action, 
             selector: action.selector,
             payload: action.payload || action // Some models might put payload at root
          }
        }).filter(Boolean) // Remove nulls
      }

      return parsed as LlmResponse
    } catch {
      console.error('Failed to parse LLM response', content)
      throw new Error('Invalid JSON response from LLM')
    }
  } catch (error) {
    console.error('LLM Call Failed', error)
    throw error
  }
}
