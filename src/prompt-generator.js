/**
 * 风格化图标提示词生成器
 * 根据用户输入的图标清单和视觉风格，生成专业的 AI 绘图提示词
 */

// 风格关键词映射表
const STYLE_KEYWORDS = {
  // 3D 黏土风
  '黏土风': {
    style: '3D cute clay style, minimalist isometric UI design',
    material: 'Smooth matte plastic finish, soft squishy texture, subtle surface imperfections',
    lighting: 'Soft studio lighting, pastel color palette, rendered in Blender 3D, Octane render',
    background: 'solid white background'
  },
  // 毛玻璃风格
  '毛玻璃': {
    style: 'Ultra-modern frosted glassmorphism style',
    material: 'Translucent acrylic panels with glowing edges, layered depth effect',
    lighting: 'Soft ambient occlusion, subtle inner glow, high fidelity rendering',
    background: 'solid dark background'
  },
  // 赛博朋克
  '赛博朋克': {
    style: 'Cyberpunk neon line art, futuristic tech aesthetic',
    material: 'Glowing neon tubes on dark brushed metal, holographic elements',
    lighting: 'Cinematic lighting, volumetric glow, high contrast, RGB accents',
    background: 'solid dark background'
  },
  // 极简扁平
  '极简扁平': {
    style: 'Minimalist flat design, clean geometric shapes',
    material: 'Solid color fills, no gradients, crisp edges',
    lighting: 'Even lighting, no shadows, pure 2D aesthetic',
    background: 'solid white background'
  },
  // 拟物化
  '拟物化': {
    style: 'Realistic skeuomorphic design, detailed textures',
    material: 'Real-world materials, metal brushes, leather textures',
    lighting: 'Photorealistic lighting, accurate reflections and shadows',
    background: 'solid white background'
  },
  // 卡通风格
  '卡通': {
    style: 'Playful cartoon style, bold outlines',
    material: 'Cel-shaded surfaces, vibrant colors',
    lighting: 'Bright cartoon lighting, soft shadows',
    background: 'solid white background'
  },
  // 渐变风格
  '渐变': {
    style: 'Modern gradient design, vibrant color transitions',
    material: 'Smooth gradient fills, glossy finish',
    lighting: 'Soft gradient lighting, iridescent effects',
    background: 'solid white background'
  },
  // 线框风格
  '线框': {
    style: 'Wireframe technical drawing, blueprint aesthetic',
    material: 'Clean line art, technical precision',
    lighting: 'Even technical lighting, no shading',
    background: 'solid dark background'
  }
};

// 图标翻译映射
const ICON_TRANSLATIONS = {
  '主页': 'a house icon',
  '首页': 'a house icon',
  '购物车': 'a shopping cart',
  '设置': 'a gear settings icon',
  '个人中心': 'a user profile icon',
  '用户': 'a user icon',
  '搜索': 'a magnifying glass',
  '消息': 'a message bubble',
  '通知': 'a bell notification',
  '收藏': 'a heart favorite',
  '喜欢': 'a heart favorite',
  '分享': 'a share arrow',
  '下载': 'a download arrow',
  '上传': 'an upload arrow',
  '删除': 'a trash bin',
  '编辑': 'a pencil edit',
  '添加': 'a plus add button',
  '关闭': 'a close X mark',
  '菜单': 'a hamburger menu',
  '更多': 'three dots more options',
  '相机': 'a camera',
  '图片': 'a photo image',
  '视频': 'a video play button',
  '音乐': 'a music note',
  '文件': 'a document file',
  '文件夹': 'a folder',
  '锁': 'a lock',
  '解锁': 'an unlocked padlock',
  '星': 'a star',
  '时钟': 'a clock time',
  '日历': 'a calendar',
  '电话': 'a phone receiver',
  '邮件': 'an envelope email',
  '定位': 'a map pin location',
  '导航': 'a compass navigation',
  '刷新': 'a refresh circular arrow',
  '返回': 'a back arrow',
  '前进': 'a forward arrow',
  '向上': 'an up arrow',
  '向下': 'a down arrow'
};

/**
 * 翻译图标名称为英文
 * @param {string[]} icons - 中文图标名称数组
 * @returns {string} - 英文图标描述，逗号分隔
 */
function translateIcons(icons) {
  return icons.map(icon => {
    // 先尝试精确匹配
    if (ICON_TRANSLATIONS[icon]) {
      return ICON_TRANSLATIONS[icon];
    }
    // 尝试模糊匹配
    for (const [cn, en] of Object.entries(ICON_TRANSLATIONS)) {
      if (icon.includes(cn)) {
        return en;
      }
    }
    // 如果没有匹配，返回原中文（让 AI 理解）
    return icon;
  }).join(', ');
}

/**
 * 解析用户输入的风格，找到最匹配的风格关键词
 * @param {string} userInput - 用户输入的风格描述
 * @returns {object|null} - 匹配的风格关键词对象
 */
function parseStyle(userInput) {
  // 尝试精确匹配
  if (STYLE_KEYWORDS[userInput]) {
    return STYLE_KEYWORDS[userInput];
  }

  // 尝试模糊匹配
  for (const [styleName, keywords] of Object.entries(STYLE_KEYWORDS)) {
    if (userInput.includes(styleName)) {
      return keywords;
    }
  }

  // 如果没有匹配，返回默认风格（3D 黏土风）
  return STYLE_KEYWORDS['黏土风'];
}

/**
 * 生成最终的提示词
 * @param {string[]} icons - 图标清单
 * @param {string} style - 视觉风格
 * @returns {string} - 完整的英文提示词
 */
function generatePrompt(icons, style) {
  const styleKeywords = parseStyle(style);
  // 只取第一个图标来生成单个图标
  const iconList = translateIcons([icons[0]]);

  return `A professional UI icon featuring ${iconList}.

**[Style & Medium]**
${styleKeywords.style}.

**[Material & Texture]**
${styleKeywords.material}.

**[Lighting, Rendering & Color]**
${styleKeywords.lighting}.

**[UI Constraints]**
Professional UI design asset, ${styleKeywords.background}, isolated object, front-facing, centered composition, vector-like clean edges, high resolution, 8k, dribbble trending.

--v 6.0 --ar 1:1 --stylize 250`;
}

/**
 * 验证输入
 * @param {string[]} icons - 图标清单
 * @param {string} style - 视觉风格
 * @returns {object} - 验证结果
 */
function validateInput(icons, style) {
  if (!icons || icons.length === 0) {
    return { valid: false, error: '请提供至少一个图标名称' };
  }
  if (!style || style.trim() === '') {
    return { valid: false, error: '请提供视觉风格描述' };
  }
  return { valid: true };
}

export { generatePrompt, validateInput, STYLE_KEYWORDS, ICON_TRANSLATIONS };
