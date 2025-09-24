import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  ShoppingCart as OrderIcon,
  MonetizationOn as RevenueIcon,
  Today as TodayIcon,
  DateRange as WeekIcon,
  CalendarMonth as MonthIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface PaymentLink {
  id: number;
  title: string;
  amount: number;
  currency: string;
  wallet_address: string;
  link_id: string;
  description: string;
  callback_url?: string; // 添加回调地址字段
  status: string;
  created_at: string;
}

interface TimeStats {
  orders: number;
  revenue: number;
}

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  failed_orders: number;
  today_stats: TimeStats;
  week_stats: TimeStats;
  month_stats: TimeStats;
}

const DashboardPage: React.FC = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    amount: '',
    currency: 'CNY',
    wallet_address: '',
    description: '',
    callback_url: '', // 添加回调地址字段
  });
  const [creating, setCreating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPaymentLinks();
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchPaymentLinks = async () => {
    try {
      const response = await api.get('/api/payment-links');
      console.log('获取支付链接响应:', response.data);
      setPaymentLinks(response.data.payment_links || []);
    } catch (err: any) {
      console.error('获取支付链接失败:', err);
      setError(err.response?.data?.error || '获取支付链接失败');
      setPaymentLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin) return;

    setStatsLoading(true);
    try {
      const response = await api.get('/api/admin/dashboard/stats');
      console.log('获取统计数据响应:', response.data);
      setStats(response.data.data);
    } catch (err: any) {
      console.error('获取统计数据失败:', err);
      // 不设置错误，因为统计数据不是必需的
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!createForm.title || !createForm.amount || !createForm.wallet_address) {
      setError('请填写必填字段');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/api/payment-links', {
        title: createForm.title,
        amount: parseFloat(createForm.amount),
        currency: createForm.currency,
        wallet_address: createForm.wallet_address,
        description: createForm.description,
        callback_url: createForm.callback_url, // 添加回调地址
      });
      
      console.log('创建成功:', response.data);
      
      setOpenCreateDialog(false);
      setCreateForm({
        title: '',
        amount: '',
        currency: 'CNY',
        wallet_address: '',
        description: '',
        callback_url: '',
      });
      
      // 添加延迟确保后端数据已保存
      setTimeout(() => {
        fetchPaymentLinks();
      }, 500);
      
    } catch (err: any) {
      console.error('创建失败:', err);
      setError(err.response?.data?.error || '创建支付链接失败');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // 检查是否支持现代剪贴板API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setCopyError('');
      } else {
        // 降级到传统方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setCopySuccess(true);
          setCopyError('');
        } else {
          throw new Error('复制命令失败');
        }
      }
    } catch (err) {
      console.error('复制失败:', err);
      setCopyError('复制失败，请手动复制链接');
      setCopySuccess(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个支付链接吗？')) {
      try {
        await api.delete(`/api/payment-links/${id}`);
        fetchPaymentLinks();
      } catch (err: any) {
        setError(err.response?.data?.error || '删除失败');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPaymentUrl = (linkId: string) => {
    return `${window.location.origin}/pay/${linkId}`;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white'
    }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#ffffff',
              fontWeight: 'bold'
            }}
          >
            支付链接管理
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: '#b0b0b0' }}>
            欢迎，{user?.name}
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ 
              color: '#00ff88',
              '&:hover': { backgroundColor: 'rgba(0, 255, 136, 0.1)' }
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              color: '#ffffff',
              fontWeight: 'bold'
            }}
          >
            我的支付链接
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAdmin && (
              <Button
                variant="outlined"
                startIcon={<AdminIcon />}
                onClick={() => navigate('/admin')}
                sx={{
                  borderColor: 'rgba(255, 193, 7, 0.5)',
                  color: '#ffc107',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                管理后台
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #00ff88, #00ccff)',
                color: '#000',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00cc6a, #0099cc)',
                  boxShadow: '0 12px 40px rgba(0, 255, 136, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              创建新链接
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              color: '#ff4444'
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* 统计数据卡片 - 仅管理员可见 */}
        {isAdmin && stats && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: '#ffffff',
                fontWeight: 'bold',
                mb: 3
              }}
            >
              📊 数据统计
            </Typography>

            {/* 主要统计数据 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <OrderIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>总订单数</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.total_orders}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
                }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <RevenueIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>总收入</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.total_revenue.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>USDT</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
                }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <TrendingUpIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>已完成</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.completed_orders}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
                }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <WalletIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>待付款</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.pending_orders}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 时间维度统计 */}
            <Typography
              variant="h6"
              component="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              📈 时间统计
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TodayIcon sx={{ mr: 1, color: '#ffc107' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>今日</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                      订单数: {stats.today_stats?.orders || stats.completed_orders}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffc107' }}>
                      {stats.today_stats?.revenue?.toFixed(2) || stats.total_revenue.toFixed(2)} USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WeekIcon sx={{ mr: 1, color: '#00ff88' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>本周</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                      订单数: {stats.week_stats?.orders || stats.total_orders}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00ff88' }}>
                      {stats.week_stats?.revenue?.toFixed(2) || stats.total_revenue.toFixed(2)} USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MonthIcon sx={{ mr: 1, color: '#00ccff' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>本月</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                      订单数: {stats.month_stats?.orders || stats.total_orders}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00ccff' }}>
                      {stats.month_stats?.revenue?.toFixed(2) || stats.total_revenue.toFixed(2)} USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {loading && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress 
              sx={{ 
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #00ff88, #00ccff)'
                }
              }} 
            />
          </Box>
        )}

        <Grid container spacing={3}>
          {(paymentLinks || []).map((link) => (
            <Grid item xs={12} md={6} lg={4} key={link.id}>
              <Card sx={{
                background: 'rgba(26, 26, 46, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                  boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      component="h2"
                      sx={{ 
                        color: '#ffffff',
                        fontWeight: 'bold'
                      }}
                    >
                      {link.title}
                    </Typography>
                    <Chip
                      label={link.status === 'active' ? '活跃' : '已停用'}
                      color={link.status === 'active' ? 'success' : 'default'}
                      size="small"
                      sx={{
                        background: link.status === 'active' 
                          ? 'linear-gradient(45deg, #00ff88, #00cc6a)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: link.status === 'active' ? '#000' : '#b0b0b0',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #00ff88, #00ccff)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  >
                    {link.amount} {link.currency}
                  </Typography>
                  
                  {link.description && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b0b0b0',
                        mb: 2,
                        fontStyle: 'italic'
                      }}
                    >
                      {link.description}
                    </Typography>
                  )}
                  
                  <Paper sx={{ 
                    p: 2, 
                    mb: 2, 
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 255, 136, 0.1)'
                  }}>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      <strong style={{ color: '#00ff88' }}>钱包地址:</strong>
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b0b0b0',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {link.wallet_address}
                    </Typography>
                  </Paper>
                  
                  {link.callback_url && (
                    <Paper sx={{ 
                      p: 2, 
                      mb: 2, 
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 193, 7, 0.1)'
                    }}>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        <strong style={{ color: '#ffc107' }}>回调地址:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#b0b0b0',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {link.callback_url}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666666',
                      display: 'block',
                      mb: 2
                    }}
                  >
                    创建时间: {new Date(link.created_at).toLocaleDateString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={() => copyToClipboard(getPaymentUrl(link.link_id))}
                      sx={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        color: '#00ff88',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        '&:hover': {
                          background: 'rgba(0, 255, 136, 0.2)',
                          borderColor: 'rgba(0, 255, 136, 0.5)'
                        }
                      }}
                    >
                      复制链接
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(link.id)}
                      sx={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        color: '#ff4444',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        '&:hover': {
                          background: 'rgba(255, 68, 68, 0.2)',
                          borderColor: 'rgba(255, 68, 68, 0.5)'
                        }
                      }}
                    >
                      删除
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {(!paymentLinks || paymentLinks.length === 0) && !loading && (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#b0b0b0',
                mb: 2
              }}
            >
              还没有支付链接
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666666',
                fontStyle: 'italic'
              }}
            >
              点击"创建新链接"开始创建您的第一个支付链接
            </Typography>
          </Box>
        )}
      </Container>

      {/* 创建支付链接对话框 */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#ffffff',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)'
        }}>
          创建支付链接
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="链接标题"
            fullWidth
            variant="outlined"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="金额"
            type="number"
            fullWidth
            variant="outlined"
            value={createForm.amount}
            onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="货币"
            fullWidth
            variant="outlined"
            value={createForm.currency}
            onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="USDT钱包地址"
            fullWidth
            variant="outlined"
            value={createForm.wallet_address}
            onChange={(e) => setCreateForm({ ...createForm, wallet_address: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="描述（可选）"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="回调地址（可选）"
            fullWidth
            variant="outlined"
            placeholder="https://your-domain.com/callback"
            value={createForm.callback_url}
            onChange={(e) => setCreateForm({ ...createForm, callback_url: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 255, 136, 0.2)' }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)}
            sx={{ 
              color: '#b0b0b0',
              '&:hover': { color: '#ffffff' }
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleCreatePaymentLink} 
            variant="contained" 
            disabled={creating}
            sx={{
              background: 'linear-gradient(45deg, #00ff88, #00ccff)',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #00cc6a, #0099cc)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#666666'
              }
            }}
          >
            {creating ? '创建中...' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 复制成功提示 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="链接已复制到剪贴板"
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'linear-gradient(45deg, #00ff88, #00ccff)',
            color: '#000',
            fontWeight: 'bold'
          }
        }}
      />

      {/* 复制失败提示 */}
      <Snackbar
        open={!!copyError}
        autoHideDuration={5000}
        onClose={() => setCopyError('')}
        message={copyError}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'linear-gradient(45deg, #ff4444, #ff6666)',
            color: '#fff',
            fontWeight: 'bold'
          }
        }}
      />
    </Box>
  );
};

export default DashboardPage;
