import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import AdminNavigation from '../components/AdminNavigation';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  Pending as PendingIcon,
  CheckCircle as CompletedIcon,
  Cancel as FailedIcon,
  Dashboard as DashboardIcon,
  Person as UserIcon,
  Receipt as OrderIcon,
  AccountBalanceWallet as WalletIcon,
  Today as TodayIcon,
  DateRange as WeekIcon,
  CalendarMonth as MonthIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

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

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/dashboard/stats');
      setStats(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || '获取统计信息失败');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string; 
    subtitle?: string;
  }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15, ${color}05)` }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              backgroundColor: `${color}20`,
              color: color 
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon, 
    onClick, 
    color 
  }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void; 
    color: string;
  }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          background: `linear-gradient(135deg, ${color}10, ${color}05)`
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              backgroundColor: `${color}20`,
              color: color,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardStats}>
          重试
        </Button>
      </Container>
    );
  }

  return (
    <>
      <AdminNavigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* 页面标题 */}
        <Box display="flex" alignItems="center" mb={4}>
          <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            管理员仪表板
          </Typography>
        </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="总用户数"
            value={stats?.total_users || 0}
            icon={<PeopleIcon />}
            color="#2196F3"
            subtitle="注册用户总数"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="总订单数"
            value={stats?.total_orders || 0}
            icon={<OrdersIcon />}
            color="#4CAF50"
            subtitle="所有订单总数"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="总收入"
            value={`$${(stats?.total_revenue || 0).toFixed(2)}`}
            icon={<RevenueIcon />}
            color="#FF9800"
            subtitle="已完成订单收入"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="待处理订单"
            value={stats?.pending_orders || 0}
            icon={<PendingIcon />}
            color="#FFC107"
            subtitle="等待支付的订单"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="已完成订单"
            value={stats?.completed_orders || 0}
            icon={<CompletedIcon />}
            color="#4CAF50"
            subtitle="支付成功的订单"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="失败订单"
            value={stats?.failed_orders || 0}
            icon={<FailedIcon />}
            color="#F44336"
            subtitle="已过期的订单"
          />
        </Grid>
      </Grid>

      {/* 时间维度统计 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          📈 时间维度统计
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="今日"
              value={`${stats?.today_stats?.orders || stats?.completed_orders || 0}笔`}
              icon={<TodayIcon />}
              color="#FFC107"
              subtitle={`收入: ${(stats?.today_stats?.revenue || stats?.total_revenue || 0).toFixed(2)} USDT`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="本周"
              value={`${stats?.week_stats?.orders || stats?.total_orders || 0}笔`}
              icon={<WeekIcon />}
              color="#00FF88"
              subtitle={`收入: ${(stats?.week_stats?.revenue || stats?.total_revenue || 0).toFixed(2)} USDT`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="本月"
              value={`${stats?.month_stats?.orders || stats?.total_orders || 0}笔`}
              icon={<MonthIcon />}
              color="#00CCFF"
              subtitle={`收入: ${(stats?.month_stats?.revenue || stats?.total_revenue || 0).toFixed(2)} USDT`}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          快速操作
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="用户管理"
              description="查看、编辑和删除用户账户"
              icon={<UserIcon />}
              onClick={() => navigate('/admin/users')}
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="订单管理"
              description="查看和管理所有支付订单"
              icon={<OrderIcon />}
              onClick={() => navigate('/admin/orders')}
              color="#4CAF50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="中间人钱包"
              description="管理中间人钱包和转账记录"
              icon={<WalletIcon />}
              onClick={() => navigate('/admin/middleman')}
              color="#FF9800"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 系统状态 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          系统状态
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Chip 
                label="系统运行正常" 
                color="success" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">后端服务</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Chip 
                label="连接正常" 
                color="success" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">数据库</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Chip 
                label="在线" 
                color="success" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">Epusdt服务</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Chip 
                label="活跃" 
                color="success" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">前端服务</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      </Container>
    </>
  );
};

export default AdminDashboardPage;
