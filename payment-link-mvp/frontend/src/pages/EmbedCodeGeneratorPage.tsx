import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmbedCodeGeneratorPage: React.FC = () => {
  const { user } = useAuth();

  // 表单状态
  const [config, setConfig] = useState({
    title: '商品支付',
    amount: 10,
    description: '请支付商品费用',
    currency: 'USDT',
    theme: 'light',
    width: '400',
    height: '600',
    showClose: true,
    autoClose: 3000,
    callbackUrl: '',
    successUrl: '',
    cancelUrl: '',
  });

  // UI状态
  const [activeTab, setActiveTab] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyType, setCopyType] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // 生成的代码
  const [generatedCodes, setGeneratedCodes] = useState({
    html: '',
    javascript: '',
    react: '',
  });

  // 获取或生成API Key
  useEffect(() => {
    if (user) {
      // 这里应该调用API获取或生成用户的API Key
      // 暂时使用模拟的API Key
      setApiKey('pk_live_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    }
  }, [user]);

  // 当配置改变时生成代码
  useEffect(() => {
    generateCodes();
  }, [config, apiKey]);

  // 生成各种嵌入代码
  const generateCodes = () => {
    const baseUrl = 'http://47.109.140.124:3000';

    // HTML iframe代码
    const htmlCode = `<!-- USDT支付嵌入代码 -->
<iframe
  src="${baseUrl}/embed/create?${new URLSearchParams({
    title: config.title,
    amount: config.amount.toString(),
    description: config.description,
    currency: config.currency,
    theme: config.theme,
    api_key: apiKey,
  }).toString()}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>`;

    // JavaScript SDK代码
    const jsCode = `<!-- 引入USDT支付SDK -->
<script src="${baseUrl}/usdt-pay-sdk.js"></script>

<!-- 支付按钮 -->
<button id="pay-button" style="
  background: linear-gradient(135deg, #00ff88, #00ccff);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
">
  立即支付 ${config.amount} ${config.currency}
</button>

<script>
document.getElementById('pay-button').addEventListener('click', function() {
  USDTPaySDK.init({
    apiKey: '${apiKey}',
    amount: ${config.amount},
    currency: '${config.currency}',
    title: '${config.title}',
    description: '${config.description}',
    theme: '${config.theme}',
    width: '${config.width}px',
    height: '${config.height}px',
    showClose: ${config.showClose},
    autoClose: ${config.autoClose},
    ${config.callbackUrl ? `callbackUrl: '${config.callbackUrl}',` : ''}
    ${config.successUrl ? `successUrl: '${config.successUrl}',` : ''}
    ${config.cancelUrl ? `cancelUrl: '${config.cancelUrl}',` : ''}

    onSuccess: function(data) {
      console.log('支付成功:', data);
      alert('支付成功！');
      // 在这里处理支付成功逻辑
    },

    onError: function(error) {
      console.log('支付失败:', error);
      alert('支付失败：' + error.message);
      // 在这里处理支付失败逻辑
    },

    onCancel: function() {
      console.log('用户取消支付');
      // 在这里处理用户取消逻辑
    }
  });
});
</script>`;

    // React代码
    const reactCode = `import React from 'react';

// 安装USDT支付SDK: npm install usdt-pay-sdk
// import USDTPaySDK from 'usdt-pay-sdk';

const PaymentButton = () => {
  const handlePayment = () => {
    // 如果使用npm包
    // USDTPaySDK.init({...});

    // 或者直接使用全局对象（需要在HTML中引入SDK）
    if (window.USDTPaySDK) {
      window.USDTPaySDK.init({
        apiKey: '${apiKey}',
        amount: ${config.amount},
        currency: '${config.currency}',
        title: '${config.title}',
        description: '${config.description}',
        theme: '${config.theme}',
        width: '${config.width}px',
        height: '${config.height}px',
        showClose: ${config.showClose},
        autoClose: ${config.autoClose},
        ${config.callbackUrl ? `callbackUrl: '${config.callbackUrl}',` : ''}
        ${config.successUrl ? `successUrl: '${config.successUrl}',` : ''}
        ${config.cancelUrl ? `cancelUrl: '${config.cancelUrl}',` : ''}

        onSuccess: (data) => {
          console.log('支付成功:', data);
          // 处理支付成功
        },

        onError: (error) => {
          console.log('支付失败:', error);
          // 处理支付失败
        },

        onCancel: () => {
          console.log('用户取消支付');
          // 处理用户取消
        }
      });
    }
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        background: 'linear-gradient(135deg, #00ff88, #00ccff)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      立即支付 ${config.amount} ${config.currency}
    </button>
  );
};

export default PaymentButton;`;

    setGeneratedCodes({
      html: htmlCode,
      javascript: jsCode,
      react: reactCode,
    });
  };

  // 复制代码到剪贴板
  const handleCopy = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setCopyType(type);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 预览支付界面
  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🚀 一键嵌入代码生成器
        </Typography>
        <Typography variant="body1" color="textSecondary">
          零代码集成加密货币支付系统，只需一行代码即可为您的网站添加USDT支付功能
        </Typography>
      </Box>

      {/* API Key管理 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                API密钥
              </Typography>
              <Typography variant="body2" color="textSecondary">
                用于身份验证的API密钥，请妥善保管
              </Typography>
            </Box>
            <Box>
              <Chip
                label={apiKey ? `${apiKey.substring(0, 12)}...` : '未设置'}
                color={apiKey ? 'success' : 'default'}
                sx={{ mr: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setApiKeyDialog(true)}
              >
                管理密钥
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" gap={4}>
        {/* 左侧配置面板 */}
        <Card sx={{ width: '400px', height: 'fit-content' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚙️ 支付配置
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
              {/* 基本信息 */}
              <TextField
                label="支付标题"
                value={config.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                label="支付金额"
                type="number"
                value={config.amount}
                onChange={(e) => handleConfigChange('amount', parseFloat(e.target.value) || 0)}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2" color="textSecondary">USDT</Typography>
                }}
              />

              <TextField
                label="商品描述"
                value={config.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />

              {/* 外观设置 */}
              <Divider>外观设置</Divider>

              <FormControl size="small">
                <InputLabel>主题</InputLabel>
                <Select
                  value={config.theme}
                  onChange={(e) => handleConfigChange('theme', e.target.value)}
                  label="主题"
                >
                  <MenuItem value="light">浅色主题</MenuItem>
                  <MenuItem value="dark">深色主题</MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" gap={2}>
                <TextField
                  label="宽度"
                  value={config.width}
                  onChange={(e) => handleConfigChange('width', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: <Typography variant="body2">px</Typography>
                  }}
                />
                <TextField
                  label="高度"
                  value={config.height}
                  onChange={(e) => handleConfigChange('height', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: <Typography variant="body2">px</Typography>
                  }}
                />
              </Box>

              {/* 行为设置 */}
              <Divider>行为设置</Divider>

              <FormControlLabel
                control={
                  <Switch
                    checked={config.showClose}
                    onChange={(e) => handleConfigChange('showClose', e.target.checked)}
                  />
                }
                label="显示关闭按钮"
              />

              <TextField
                label="自动关闭时间"
                type="number"
                value={config.autoClose}
                onChange={(e) => handleConfigChange('autoClose', parseInt(e.target.value) || 0)}
                size="small"
                helperText="支付成功后自动关闭时间（毫秒）"
                InputProps={{
                  endAdornment: <Typography variant="body2">ms</Typography>
                }}
              />

              {/* 回调设置 */}
              <Divider>回调URL（可选）</Divider>

              <TextField
                label="回调通知URL"
                value={config.callbackUrl}
                onChange={(e) => handleConfigChange('callbackUrl', e.target.value)}
                fullWidth
                size="small"
                helperText="支付完成后的服务器回调地址"
              />

              <TextField
                label="成功跳转URL"
                value={config.successUrl}
                onChange={(e) => handleConfigChange('successUrl', e.target.value)}
                fullWidth
                size="small"
                helperText="支付成功后的跳转页面"
              />

              <TextField
                label="取消跳转URL"
                value={config.cancelUrl}
                onChange={(e) => handleConfigChange('cancelUrl', e.target.value)}
                fullWidth
                size="small"
                helperText="取消支付后的跳转页面"
              />

              {/* 操作按钮 */}
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="contained"
                  onClick={handlePreview}
                  startIcon={<PreviewIcon />}
                  fullWidth
                >
                  预览效果
                </Button>
                <Button
                  variant="outlined"
                  onClick={generateCodes}
                  startIcon={<RefreshIcon />}
                >
                  刷新
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 右侧代码展示 */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                生成的嵌入代码
              </Typography>

              {/* 代码类型选项卡 */}
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="HTML iframe" />
                <Tab label="JavaScript SDK" />
                <Tab label="React组件" />
              </Tabs>

              {/* HTML代码 */}
              <TabPanel value={activeTab} index={0}>
                <Box position="relative">
                  <SyntaxHighlighter
                    language="html"
                    style={tomorrow}
                    customStyle={{
                      borderRadius: '8px',
                      fontSize: '14px',
                      maxHeight: '500px',
                    }}
                  >
                    {generatedCodes.html}
                  </SyntaxHighlighter>
                  <IconButton
                    onClick={() => handleCopy(generatedCodes.html, 'HTML')}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>HTML iframe方式：</strong>直接在HTML中嵌入iframe，最简单的集成方式，适合静态网站。
                </Alert>
              </TabPanel>

              {/* JavaScript代码 */}
              <TabPanel value={activeTab} index={1}>
                <Box position="relative">
                  <SyntaxHighlighter
                    language="javascript"
                    style={tomorrow}
                    customStyle={{
                      borderRadius: '8px',
                      fontSize: '14px',
                      maxHeight: '500px',
                    }}
                  >
                    {generatedCodes.javascript}
                  </SyntaxHighlighter>
                  <IconButton
                    onClick={() => handleCopy(generatedCodes.javascript, 'JavaScript')}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>JavaScript SDK方式：</strong>功能最丰富，支持事件回调和自定义样式，适合动态网站。
                </Alert>
              </TabPanel>

              {/* React代码 */}
              <TabPanel value={activeTab} index={2}>
                <Box position="relative">
                  <SyntaxHighlighter
                    language="jsx"
                    style={tomorrow}
                    customStyle={{
                      borderRadius: '8px',
                      fontSize: '14px',
                      maxHeight: '500px',
                    }}
                  >
                    {generatedCodes.react}
                  </SyntaxHighlighter>
                  <IconButton
                    onClick={() => handleCopy(generatedCodes.react, 'React')}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>React组件方式：</strong>专为React项目优化，提供组件化的集成体验。
                </Alert>
              </TabPanel>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 使用说明
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>第一步：</strong>复制上方生成的代码到您的网站中
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>第二步：</strong>确保您的API Key有效且已正确配置
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>第三步：</strong>测试支付流程，确保一切正常工作
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>注意：</strong>请妥善保管您的API Key，不要在客户端代码中暴露敏感信息
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* API Key管理对话框 */}
      <Dialog open={apiKeyDialog} onClose={() => setApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>API密钥管理</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            API密钥用于身份验证，请妥善保管，不要泄露给他人。
          </Alert>
          <TextField
            label="当前API Key"
            value={apiKey}
            fullWidth
            multiline
            rows={3}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => handleCopy(apiKey, 'API Key')}
              startIcon={<CopyIcon />}
            >
              复制
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<RefreshIcon />}
            >
              重新生成
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>支付界面预览</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{ backgroundColor: '#f5f5f5', borderRadius: 1, p: 2 }}
          >
            <Typography variant="body2" color="textSecondary">
              预览功能开发中...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 复制成功提示 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
      >
        <Alert severity="success" onClose={() => setCopySuccess(false)}>
          {copyType}代码已复制到剪贴板
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmbedCodeGeneratorPage;