import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/SupabaseClient';
import { useAuth } from '../../lib/AuthContext';
import '../Meetings/Meetings.css';
import './Sales.css';

const Sales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    product_service: '',
    value: '',
    commission_percentage: '',
    sale_date: '',
  });
  const [editingId, setEditingId] = useState(null);

  const loadSales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSales();
      loadClients();
    }
  }, [user, loadSales, loadClients]);

  const calculateCommission = (value, percentage) => {
    return (parseFloat(value) * parseFloat(percentage)) / 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const commissionValue = calculateCommission(formData.value, formData.commission_percentage);
      const saleData = {
        ...formData,
        commission_value: commissionValue,
      };

      if (editingId) {
        const { error } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sales')
          .insert([{ ...saleData, user_id: user.id }]);

        if (error) throw error;
      }

      resetForm();
      loadSales();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda: ' + error.message);
    }
  };

  const handleEdit = (sale) => {
    setFormData({
      client_id: sale.client_id || '',
      product_service: sale.product_service,
      value: sale.value,
      commission_percentage: sale.commission_percentage,
      sale_date: sale.sale_date,
    });
    setEditingId(sale.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return;

    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      loadSales();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      product_service: '',
      value: '',
      commission_percentage: '',
      sale_date: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
  const totalCommission = sales.reduce((sum, sale) => sum + parseFloat(sale.commission_value), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Vendas e Comissões</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Nova Venda'}
        </button>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <h3>Total de Vendas</h3>
          <p>R$ {totalSales.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Comissão Total</h3>
          <p>R$ {totalCommission.toFixed(2)}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Cliente</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Produto/Serviço *</label>
            <input
              type="text"
              value={formData.product_service}
              onChange={(e) => setFormData({ ...formData, product_service: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Comissão (%) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Data da Venda *</label>
            <input
              type="date"
              value={formData.sale_date}
              onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
              required
            />
          </div>

          {formData.value && formData.commission_percentage && (
            <div className="commission-preview">
              <strong>Comissão calculada:</strong> R${' '}
              {calculateCommission(formData.value, formData.commission_percentage).toFixed(2)}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="items-grid">
        {sales.length === 0 ? (
          <p className="empty-message">Nenhuma venda cadastrada.</p>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="item-card">
              <h3>{sale.product_service}</h3>
              <div className="item-details">
                {sale.clients && <span>👤 {sale.clients.name}</span>}
                <span>💰 Valor: R$ {parseFloat(sale.value).toFixed(2)}</span>
                <span>📊 Comissão: {sale.commission_percentage}%</span>
                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  💵 R$ {parseFloat(sale.commission_value).toFixed(2)}
                </span>
                <span>📅 {new Date(sale.sale_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(sale)} className="btn-edit">
                  Editar
                </button>
                <button onClick={() => handleDelete(sale.id)} className="btn-delete">
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sales;
