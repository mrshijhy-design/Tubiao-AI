import { useState, useEffect, useRef } from 'react';

// 预定义风格选项
const STYLE_OPTIONS = [
  { name: '黏土风', icon: '🎨' },
  { name: '毛玻璃', icon: '💎' },
  { name: '赛博朋克', icon: '🌆' },
  { name: '极简扁平', icon: '⬜' },
  { name: '拟物化', icon: '📱' },
  { name: '卡通', icon: '🎭' },
  { name: '渐变', icon: '🌈' },
  { name: '线框', icon: '🔲' }
];

// 常用图标选项
const COMMON_ICONS = [
  '主页', '购物车', '设置', '个人中心', '搜索',
  '消息', '通知', '收藏', '分享', '下载',
  '上传', '删除', '编辑', '添加', '关闭',
  '菜单', '相机', '图片', '视频', '音乐',
  '文件', '文件夹', '锁', '星', '时钟',
  '日历', '电话', '邮件', '定位', '刷新'
];

// Nano Banana API 基础 URL
const API_BASE_URL = 'https://api.kie.ai/api/v1';

function App() {
  const [icons, setIcons] = useState([]);
  const [iconInput, setIconInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('黏土风');
  const [customStyle, setCustomStyle] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [primaryBtnHover, setPrimaryBtnHover] = useState(false);
  const taskIdRef = useRef('');
  // API Key 相关状态
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // 加载保存的 API Key
  useEffect(() => {
    const savedKey = localStorage.getItem('nano_banana_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeyInput(savedKey);
    }
  }, []);

  // 保存 API Key
  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('nano_banana_api_key', apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setShowApiKey(false);
    }
  };

  // 添加图标（限制只能选择一个）
  const addIcon = (icon) => {
    if (!icons.includes(icon)) {
      setIcons([icon]); // 只能选择一个图标
    }
  };

  // 移除图标
  const removeIcon = (icon) => {
    setIcons(icons.filter(i => i !== icon));
  };

  // 手动输入图标（限制只能选择一个）
  const handleIconInputSubmit = (e) => {
    e.preventDefault();
    const newIcons = iconInput.split(/[,,\s]+/).filter(i => i.trim());
    if (newIcons.length > 0) {
      setIcons([newIcons[0]]); // 只取第一个输入的图标
    }
    setIconInput('');
  };

  // 生成提示词
  const generatePromptOnly = async () => {
    if (icons.length === 0) {
      alert('请至少选择一个图标');
      return;
    }
    if (!apiKey) {
      alert('请先配置 API Key');
      return;
    }

    setLoading(true);
    try {
      const style = customStyle || selectedStyle;
      // 调用后端 API 生成提示词（用于本地开发）
      const res = await fetch('/api/create-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ icons, style })
      });

      // 如果本地 API 不可用，在前端直接生成提示词
      if (!res.ok) {
        // 在前端生成提示词（简化版）
        const iconList = icons[0];
        const prompt = `A professional UI icon featuring ${iconList}.\n\n**[Style & Medium]**\n${style}.\n\n**[Material & Texture]**\nHigh quality rendering.\n\n**[Lighting, Rendering & Color]**\nProfessional studio lighting.\n\n**[UI Constraints]**\nProfessional UI design asset, solid background, isolated object, front-facing, centered composition, vector-like clean edges, high resolution, 8k.\n\n--v 6.0 --ar 1:1 --stylize 250`;
        setGeneratedPrompt(prompt);
        setTaskStatus('提示词生成成功');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
        setTaskStatus('提示词生成成功');
      } else {
        setTaskStatus('错误：' + (data.error || '未知错误'));
      }
    } catch (error) {
      setTaskStatus('请求失败：' + error.message);
    }
    setLoading(false);
  };

  // 生成图标
  const generateIcons = async () => {
    if (icons.length === 0) {
      alert('请至少选择一个图标');
      return;
    }
    if (!apiKey) {
      alert('请先配置 API Key');
      return;
    }

    setLoading(true);
    setTaskStatus('正在创建任务...');
    setResultUrl('');
    setTaskId('');
    taskIdRef.current = '';
    setGeneratedPrompt('');

    try {
      const style = customStyle || selectedStyle;

      // 在前端生成提示词
      const iconList = icons[0];
      const prompt = `A professional UI icon featuring ${iconList}.\n\n**[Style & Medium]**\n${style}.\n\n**[Material & Texture]**\nHigh quality rendering.\n\n**[Lighting, Rendering & Color]**\nProfessional studio lighting.\n\n**[UI Constraints]**\nProfessional UI design asset, solid background, isolated object, front-facing, centered composition, vector-like clean edges, high resolution, 8k.\n\n--v 6.0 --ar 1:1 --stylize 250`;

      // 直接调用 Nano Banana API
      const res = await fetch(`${API_BASE_URL}/jobs/createTask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nano-banana-2',
          input: {
            prompt,
            aspect_ratio: '1:1',
            resolution: '2K',
            output_format: 'png'
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.data && data.data.taskId) {
        setTaskId(data.data.taskId);
        taskIdRef.current = data.data.taskId;
        setGeneratedPrompt(prompt);
        setTaskStatus('任务已创建，正在生成中...');

        const interval = setInterval(pollTaskStatus, 3000);
        setPollingInterval(interval);
      } else {
        setTaskStatus('错误：' + (data.msg || '未知错误'));
      }
    } catch (error) {
      setTaskStatus('请求失败：' + error.message);
    }
    setLoading(false);
  };

  // 轮询任务状态
  const pollTaskStatus = async () => {
    if (!taskIdRef.current) return;

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/recordInfo?taskId=${taskIdRef.current}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('轮询响应:', data);

      if (!data.data) {
        console.warn('没有 data.data 字段:', data);
        return;
      }

      const state = data.data.state;
      console.log('任务状态:', state);

      if (state === 'success') {
        setTaskStatus('生成成功');
        const result = JSON.parse(data.data.resultJson);
        if (result.resultUrls && result.resultUrls[0]) {
          setResultUrl(result.resultUrls[0]);
        }
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } else if (state === 'fail') {
        setTaskStatus(`生成失败：${data.data.failMsg}`);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } else if (state === 'pending' || state === 'running' || state === 'processing') {
        setTaskStatus(`状态：${state}`);
      } else if (state) {
        setTaskStatus(`状态：${state}`);
      }
    } catch (error) {
      console.error('轮询错误:', error);
      setTaskStatus('查询失败：' + error.message);
    }
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    taskIdRef.current = '';
  };

  const copyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* 网格背景 */}
      <div style={styles.gridBackground}></div>

      <div style={styles.container}>
        {/* 头部 */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>风格化图标生成器</h1>
            <p style={styles.subtitle}>基于 AI 的专业图标生成工具</p>
          </div>
          <div style={styles.headerStatus}>
            {apiKey ? (
              <span style={styles.statusBadge}>
                <span style={styles.statusDot}></span>
                API 已连接
              </span>
            ) : (
              <span style={styles.statusBadgeWarning}>
                <span style={styles.statusDotWarning}></span>
                需要 API Key
              </span>
            )}
          </div>
        </header>

        {/* API 设置卡片 */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>API 配置</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.apiKeyRow}>
              <div style={styles.inputGroup}>
                {showApiKey ? (
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="请输入 Nano Banana API Key"
                    style={styles.input}
                  />
                ) : (
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-••••••••••••"
                    style={styles.input}
                    autoComplete="off"
                  />
                )}
              </div>
              <button onClick={() => setShowApiKey(!showApiKey)} style={styles.iconButton}>
                {showApiKey ? '🙈' : '👁️'}
              </button>
              <button onClick={saveApiKey} style={styles.primaryButton}>
                保存
              </button>
            </div>
            <a href="https://kie.ai/api-key" target="_blank" rel="noopener noreferrer" style={styles.link}>
              获取 API Key →
            </a>
          </div>
        </section>

        {/* 图标选择 */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>选择图标</span>
            <span style={styles.cardCount}>单选模式</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.iconGrid}>
              {COMMON_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => icons.includes(icon) ? removeIcon(icon) : addIcon(icon)}
                  className={icons.includes(icon) ? 'selected' : ''}
                  style={{
                    ...styles.iconChip,
                    ...(icons.includes(icon) ? styles.iconChipSelected : {})
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            <form onSubmit={handleIconInputSubmit} style={styles.inputRow}>
              <input
                type="text"
                value={iconInput}
                onChange={(e) => setIconInput(e.target.value)}
                placeholder="自定义图标名称，用逗号分隔"
                style={styles.input}
              />
              <button type="submit" style={styles.secondaryButton}>添加</button>
            </form>

            {icons.length > 0 && (
              <div style={styles.selectedTags}>
                {icons.map(icon => (
                  <span key={icon} style={styles.tag}>
                    {icon}
                    <button onClick={() => removeIcon(icon)} style={styles.tagRemove}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 风格选择 */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>选择风格</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.styleGrid}>
              {STYLE_OPTIONS.map(style => (
                <button
                  key={style.name}
                  onClick={() => {
                    setSelectedStyle(style.name);
                    setCustomStyle('');
                  }}
                  className={(selectedStyle === style.name && !customStyle) ? 'selected' : ''}
                  style={{
                    ...styles.styleCard,
                    ...(selectedStyle === style.name && !customStyle ? styles.styleCardSelected : {})
                  }}
                >
                  <span style={styles.styleIcon}>{style.icon}</span>
                  <span style={styles.styleName}>{style.name}</span>
                </button>
              ))}
            </div>

            <div style={styles.customStyleRow}>
              <input
                type="text"
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                placeholder="或输入自定义风格描述"
                style={styles.input}
              />
            </div>
          </div>
        </section>

        {/* 操作按钮 */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>生成</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.buttonRow}>
              <button
                onClick={generatePromptOnly}
                disabled={loading || icons.length === 0}
                style={{
                  ...styles.secondaryButton,
                  ...styles.buttonLarge,
                  ...(loading || icons.length === 0 ? styles.buttonDisabled : {})
                }}
              >
                仅生成提示词
              </button>
              <button
                onClick={generateIcons}
                disabled={loading || icons.length === 0}
                onMouseEnter={() => setPrimaryBtnHover(true)}
                onMouseLeave={() => setPrimaryBtnHover(false)}
                style={{
                  ...styles.primaryButton,
                  ...styles.buttonLarge,
                  ...(loading || icons.length === 0 ? styles.buttonDisabled : {}),
                  ...(primaryBtnHover ? { backgroundColor: '#333' } : {})
                }}
              >
                {loading ? '生成中...' : '生成图标'}
              </button>
            </div>
          </div>
        </section>

        {/* 状态显示 */}
        {taskStatus && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardLabel}>状态</span>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.statusRow}>
                <span style={styles.statusText}>{taskStatus}</span>
                {pollingInterval && (
                  <button onClick={stopPolling} style={styles.stopButton}>
                    停止
                  </button>
                )}
              </div>
              {loading && <div style={styles.progressBar}></div>}
            </div>
          </section>
        )}

        {/* 提示词显示 */}
        {generatedPrompt && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardLabel}>生成的提示词</span>
              <button onClick={copyPrompt} style={styles.copyButton}>
                复制
              </button>
            </div>
            <div style={styles.cardContent}>
              <pre style={styles.promptBox}>{generatedPrompt}</pre>
            </div>
          </section>
        )}

        {/* 结果图片 */}
        {resultUrl && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardLabel}>生成结果</span>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.resultContainer}>
                <img src={resultUrl} alt="生成的图标" style={styles.resultImage} />
              </div>
              <div style={styles.resultActions}>
                <a href={resultUrl} target="_blank" rel="noopener noreferrer" style={styles.secondaryButton}>
                  打开原图
                </a>
                <a href={resultUrl} download style={styles.primaryButton}>
                  下载
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 页脚 */}
        <footer style={styles.footer}>
          <span>技术支持：Nano Banana API</span>
          <span>v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#fafafa',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px',
    pointerEvents: 'none',
    zIndex: 0
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(0,0,0,0.06)'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace'
  },
  headerStatus: {
    marginTop: '8px'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontFamily: 'ui-monospace, monospace'
  },
  statusBadgeWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontFamily: 'ui-monospace, monospace'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#059669'
  },
  statusDotWarning: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#d97706'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    backgroundColor: 'rgba(0,0,0,0.02)'
  },
  cardLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'ui-monospace, monospace'
  },
  cardCount: {
    fontSize: '11px',
    color: '#999',
    fontFamily: 'ui-monospace, monospace'
  },
  cardContent: {
    padding: '20px'
  },
  // API Key styles
  apiKeyRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '12px'
  },
  inputGroup: {
    flex: 1
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box'
  },
  iconButton: {
    padding: '10px 12px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.15s ease'
  },
  primaryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.15s ease'
  },
  secondaryButton: {
    padding: '10px 20px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s ease'
  },
  link: {
    fontSize: '12px',
    color: '#666',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.1)'
  },
  // Icon grid styles
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: '8px',
    marginBottom: '16px'
  },
  iconChip: {
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  iconChipSelected: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  selectedTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0,0,0,0.06)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px'
  },
  tagRemove: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
    lineHeight: 1
  },
  // Style grid styles
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    marginBottom: '16px'
  },
  styleCard: {
    padding: '16px 12px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  styleCardSelected: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  styleIcon: {
    fontSize: '24px'
  },
  styleName: {
    fontSize: '12px',
    fontWeight: '500'
  },
  customStyleRow: {
    marginTop: '8px'
  },
  // Button styles
  buttonRow: {
    display: 'flex',
    gap: '12px'
  },
  buttonLarge: {
    padding: '12px 24px',
    fontSize: '13px',
    flex: 1
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  // Status styles
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusText: {
    fontSize: '13px',
    color: '#666',
    fontFamily: 'ui-monospace, monospace'
  },
  stopButton: {
    padding: '6px 12px',
    border: '1px solid #dc2626',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'ui-monospace, monospace'
  },
  progressBar: {
    height: '2px',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: '2px',
    marginTop: '12px',
    overflow: 'hidden',
    position: 'relative'
  },
  // Prompt styles
  promptBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '11px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    fontFamily: 'ui-monospace, monospace',
    overflowX: 'auto',
    margin: 0,
    color: '#333'
  },
  copyButton: {
    padding: '4px 10px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#666',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'ui-monospace, monospace'
  },
  // Result styles
  resultContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0'
  },
  resultImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
  },
  resultActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '16px'
  },
  // Footer styles
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    fontSize: '11px',
    color: '#999',
    fontFamily: 'ui-monospace, monospace'
  }
};

export default App;
