import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    meetings: 0,
    clients: 0,
    sales: 0,
    reminders: 0,
    totalCommission: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Contar reuniões de hoje
      const { count: meetingsCount } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', today);

      // Contar clientes
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Contar vendas e calcular comissão total
      const { data: salesData, count: salesCount } = await supabase
        .from('sales')
        .select('commission_value', { count: 'exact' })
        .eq('user_id', user.id);

      const totalCommission = salesData?.reduce((sum, sale) => sum + (sale.commission_value || 0), 0) || 0;

      // Contar lembretes pendentes
      const { count: remindersCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', false);

      setStats({
        meetings: meetingsCount || 0,
        clients: clientsCount || 0,
        sales: salesCount || 0,
        reminders: remindersCount || 0,
        totalCommission: totalCommission,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Bem-vindo de volta! Aqui está um resumo do seu dia.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Reuniões Hoje</h3>
            <p className="stat-number">{stats.meetings}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total de Clientes</h3>
            <p className="stat-number">{stats.clients}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total de Vendas</h3>
            <p className="stat-number">{stats.sales}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <h3>Comissão Total</h3>
            <p className="stat-number">R$ {stats.totalCommission.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>Lembretes Pendentes</h3>
            <p className="stat-number">{stats.reminders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

