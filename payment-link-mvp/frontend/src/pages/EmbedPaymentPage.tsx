import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

interface PaymentOrder {
  id: number;
  amount: number;
  actual_amount: number;
  currency: string;
  wallet_address: string;
  status: string;
  qr_code: string;
  blockchain_tx_id?: string;
  expires_at: string;
  created_at: string;
}

interface PaymentLink {
  id: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
}

const EmbedPaymentPage: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [searchParams] = useSearchParams();

  // URL参数
  const theme = searchParams.get('theme') || 'light';
  const embedded = searchParams.get('embedded') === 'true';

  // 状态
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyType, setCopyType] = useState<string>('');

  // 创建支付订单
  const createPaymentOrder = async () => {
    if (!linkId) return;

    try {
      const response = await api.post('/api/payment-orders', {
        link_id: linkId,
      });

      if (response.data.payment_order) {
        setPaymentOrder(response.data.payment_order);

        // 通知父窗口订单创建成功
        if (embedded) {
          window.parent.postMessage({
            type: 'payment_pending',
            data: response.data.payment_order
          }, '*');
        }
      }
    } catch (err: any) {
      console.error('创建支付订单失败:', err);
      setError(err.response?.data?.error || '创建支付订单失败');
    }
  };

  // 获取支付链接信息
  const fetchPaymentLink = async () => {
    if (!linkId) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/payment-links/${linkId}`);

      if (response.data.payment_link) {
        setPaymentLink(response.data.payment_link);

        // 如果支付链接有效，创建支付订单
        if (response.data.payment_link.status === 'active') {
          await createPaymentOrder();
        } else {
          setError('支付链接已失效');
        }
      }
    } catch (err: any) {
      console.error('获取支付链接失败:', err);
      setError(err.response?.data?.error || '支付链接不存在或已失效');
    } finally {
      setLoading(false);
    }
  };

  // 检查支付状态
  const checkPaymentStatus = async () => {
    if (!paymentOrder?.id) return;

    try {
      const response = await api.get(`/api/payment-orders/${paymentOrder.id}/status`);
      const updatedOrder = response.data.payment_order;

      if (updatedOrder.status !== paymentOrder.status) {
        setPaymentOrder(updatedOrder);

        // 通知父窗口状态变化
        if (embedded) {
          window.parent.postMessage({
            type: updatedOrder.status === 'paid' ? 'payment_success' : 'payment_failed',
            data: updatedOrder
          }, '*');
        }

        // 支付成功后停止轮询
        if (updatedOrder.status === 'paid') {
          return;
        }
      }
    } catch (err) {
      console.error('检查支付状态失败:', err);
    }
  };

  // 倒计时逻辑
  useEffect(() => {
    if (paymentOrder?.expires_at) {
      const updateTimer = () => {
        const expiresAt = new Date(paymentOrder.expires_at).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, expiresAt - now);

        setTimeLeft(Math.floor(remaining / 1000));

        if (remaining <= 0) {
          setError('支付已过期，请重新创建支付订单');
          if (embedded) {
            window.parent.postMessage({
              type: 'payment_failed',
              data: { error: '支付已过期' }
            }, '*');
          }
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentOrder?.expires_at, embedded]);

  // 定期检查支付状态
  useEffect(() => {
    if (paymentOrder && paymentOrder.status === 'pending') {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [paymentOrder]);

  // 初始化
  useEffect(() => {
    fetchPaymentLink();

    // 通知父窗口iframe已准备就绪
    if (embedded) {
      window.parent.postMessage({
        type: 'iframe_ready',
        data: { linkId }
      }, '*');
    }
  }, [linkId, embedded]);

  // 复制功能
  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setCopyType(type);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 主题样式
  const isDark = theme === 'dark';
  const themeStyles = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    cardBg: isDark ? '#2d2d2d' : '#ffffff',
    borderColor: isDark ? '#444444' : '#e0e0e0',
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: embedded ? '500px' : '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeStyles.backgroundColor,
          color: themeStyles.color,
        }}
      >
        <Box textAlign="center">
          <CircularProgress sx={{ color: '#00ff88', mb: 2 }} />
          <Typography>正在加载支付信息...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: embedded ? '500px' : '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeStyles.backgroundColor,
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: '400px' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: embedded ? '500px' : '100vh',
        backgroundColor: themeStyles.backgroundColor,
        color: themeStyles.color,
        p: embedded ? 2 : 4,
      }}
    >
      <Container maxWidth="sm">
        {/* 标题信息 */}
        <Box textAlign="center" mb={3}>
          {!embedded && (
            <Typography variant="h4" component="h1" gutterBottom>
              💰 USDT支付
            </Typography>
          )}

          {paymentLink && (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                {paymentLink.title}
              </Typography>
              {paymentLink.description && (
                <Typography variant="body2" color="textSecondary" mb={2}>
                  {paymentLink.description}
                </Typography>
              )}
            </>
          )}
        </Box>

        {paymentOrder && (
          <Card sx={{ backgroundColor: themeStyles.cardBg, boxShadow: embedded ? 1 : 3 }}>
            <CardContent>
              {/* 支付金额 */}
              <Box textAlign="center" mb={3}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#00ff88', mb: 1 }}>
                  {paymentOrder.actual_amount} {paymentOrder.currency}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  订单号: {paymentOrder.id}
                </Typography>
              </Box>

              {/* 状态显示 */}
              <Box display="flex" justifyContent="center" mb={3}>
                {paymentOrder.status === 'pending' && (
                  <Chip
                    icon={<TimeIcon />}
                    label="等待支付"
                    color="warning"
                    variant="outlined"
                  />
                )}
                {paymentOrder.status === 'paid' && (
                  <Chip
                    icon={<CheckIcon />}
                    label="支付成功"
                    color="success"
                    variant="filled"
                  />
                )}
              </Box>

              {paymentOrder.status === 'pending' && (
                <>
                  {/* 倒计时 */}
                  <Box textAlign="center" mb={3}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      支付剩余时间
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#ff6b35' }}>
                      {formatTime(timeLeft)}
                    </Typography>
                  </Box>

                  {/* 二维码 */}
                  <Box display="flex" justifyContent="center" mb={3}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: `2px solid ${themeStyles.borderColor}`,
                      }}
                    >
                      <QRCodeSVG
                        value={paymentOrder.wallet_address}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </Box>
                  </Box>

                  {/* 钱包地址 */}
                  <Box mb={3}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      收款地址 (TRC20)
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: isDark ? '#333333' : '#f5f5f5',
                        borderRadius: 1,
                        border: `1px solid ${themeStyles.borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          flex: 1,
                          mr: 1,
                        }}
                      >
                        {paymentOrder.wallet_address}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(paymentOrder.wallet_address, 'address')}
                        sx={{ color: '#00ff88' }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* 支付金额 */}
                  <Box mb={3}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      转账金额
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: isDark ? '#333333' : '#f5f5f5',
                        borderRadius: 1,
                        border: `1px solid ${themeStyles.borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {paymentOrder.actual_amount} USDT
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(paymentOrder.actual_amount.toString(), 'amount')}
                        sx={{ color: '#00ff88' }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* 重要提示 */}
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    请确保转账金额完全一致：<strong>{paymentOrder.actual_amount} USDT</strong>
                    <br />
                    网络协议：<strong>TRC20</strong>
                  </Alert>
                </>
              )}

              {paymentOrder.status === 'paid' && (
                <Box textAlign="center">
                  <Alert severity="success" sx={{ mb: 2 }}>
                    支付成功！交易已确认
                  </Alert>
                  {paymentOrder.blockchain_tx_id && (
                    <Typography variant="body2" color="textSecondary">
                      交易哈希: {paymentOrder.blockchain_tx_id}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* 复制成功提示 */}
        <Snackbar
          open={copySuccess}
          autoHideDuration={2000}
          onClose={() => setCopySuccess(false)}
        >
          <Alert severity="success" onClose={() => setCopySuccess(false)}>
            {copyType === 'address' ? '地址已复制' : '金额已复制'}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default EmbedPaymentPage;