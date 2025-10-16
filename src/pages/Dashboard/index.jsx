import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/SupabaseClient';
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
    pendingQuotesCount: 0,
    pendingQuotesValue: 0,
    totalSalesValue: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
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
        .select('value, commission_value', { count: 'exact' })
        .eq('user_id', user.id);

      const totalCommission = salesData?.reduce((sum, sale) => sum + (sale.commission_value || 0), 0) || 0;
      const totalSalesValue = salesData?.reduce((sum, sale) => sum + (sale.value || 0), 0) || 0;

      // Contar lembretes pendentes
      const { count: remindersCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', false);

      // Buscar orçamentos pendentes
      const { data: quotesData, count: quotesCount } = await supabase
        .from('quotes')
        .select('value', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'pendente');

      const pendingQuotesValue = quotesData?.reduce((sum, quote) => sum + (parseFloat(quote.value) || 0), 0) || 0;

      setStats({
        meetings: meetingsCount || 0,
        clients: clientsCount || 0,
        sales: salesCount || 0,
        reminders: remindersCount || 0,
        totalCommission: totalCommission,
        pendingQuotesCount: quotesCount || 0,
        pendingQuotesValue: pendingQuotesValue,
        totalSalesValue: totalSalesValue,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Bem-vindo de volta! Aqui está um resumo do seu dia.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>Orçamentos Pendentes</h3>
            <p className="stat-number">{stats.pendingQuotesCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💶</div>
          <div className="stat-info">
            <h3>Valor em Orçamentos</h3>
            <p className="stat-number">R$ {stats.pendingQuotesValue.toFixed(2)}</p>
          </div>
        </div>

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
        
        <div className="stat-card">
          <div className="stat-icon">🤑</div>
          <div className="stat-info">
            <h3>Valor Total Vendido</h3>
            <p className="stat-number">R$ {stats.totalSalesValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
