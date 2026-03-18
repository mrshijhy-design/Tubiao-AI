import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { generatePrompt, validateInput } from './prompt-generator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API 基础 URL
const API_BASE_URL = 'https://api.kie.ai/api/v1';

// 创建请求头（支持从请求头或环境变量获取 API Key）
const getHeaders = (clientApiKey) => {
  const apiKey = clientApiKey || process.env.NANO_BANANA_API_KEY;
  return {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };
};

// 创建生成任务
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, aspect_ratio = '1:1', resolution = '2K', output_format = 'png' } = req.body;
    const apiKey = req.headers['x-api-key'];

    const response = await axios.post(
      `${API_BASE_URL}/jobs/createTask`,
      {
        model: 'nano-banana-2',
        input: {
          prompt,
          aspect_ratio,
          resolution,
          output_format
        }
      },
      getHeaders(apiKey)
    );

    res.json(response.data);
  } catch (error) {
    console.error('Create task error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.msg || 'Failed to create task'
    });
  }
});

// 查询任务状态
app.get('/api/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const apiKey = req.headers['x-api-key'];

    const response = await axios.get(
      `${API_BASE_URL}/jobs/recordInfo?taskId=${taskId}`,
      getHeaders(apiKey)
    );

    res.json(response.data);
  } catch (error) {
    console.error('Query task error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.msg || 'Failed to query task'
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 生成提示词
app.post('/api/create-prompt', (req, res) => {
  try {
    const { icons, style } = req.body;

    const validation = validateInput(icons, style);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const prompt = generatePrompt(icons, style);
    res.json({ prompt });
  } catch (error) {
    console.error('Create prompt error:', error.message);
    res.status(500).json({
      error: 'Failed to create prompt'
    });
  }
});

// 创建图标生成任务（整合提示词生成和 API 调用）
app.post('/api/generate-icons', async (req, res) => {
  try {
    const { icons, style, aspect_ratio = '1:1', resolution = '2K', output_format = 'png' } = req.body;
    const apiKey = req.headers['x-api-key'];

    // 验证输入
    const validation = validateInput(icons, style);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 生成提示词
    const prompt = generatePrompt(icons, style);

    // 调用 Nano Banana API
    const response = await axios.post(
      `${API_BASE_URL}/jobs/createTask`,
      {
        model: 'nano-banana-2',
        input: {
          prompt,
          aspect_ratio,
          resolution,
          output_format
        }
      },
      getHeaders(apiKey)
    );

    res.json({
      taskId: response.data.data.taskId,
      prompt
    });
  } catch (error) {
    console.error('Generate icons error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.msg || 'Failed to generate icons'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
