import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/SupabaseClient';
import { useAuth } from '../../lib/AuthContext';
import '../Meetings/Meetings.css';
import './Quotes.css';

const Quotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    product_service: '',
    value: '',
    commission_percentage: '',
    quote_date: '',
    status: 'pendente',
  });
  const [editingId, setEditingId] = useState(null);

  const loadQuotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .order('quote_date', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
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
      loadQuotes();
      loadClients();
    }
  }, [user, loadQuotes, loadClients]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('quotes')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quotes')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
      }

      resetForm();
      loadQuotes();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento: ' + error.message);
    }
  };

  const handleEdit = (quote) => {
    setFormData({
      client_id: quote.client_id || '',
      product_service: quote.product_service,
      value: quote.value,
      commission_percentage: quote.commission_percentage,
      quote_date: quote.quote_date,
      status: quote.status,
    });
    setEditingId(quote.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
      loadQuotes();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      product_service: '',
      value: '',
      commission_percentage: '',
      quote_date: '',
      status: 'pendente',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleConvertToSale = async (quote) => {
    if (!window.confirm('Confirmar este orçamento e converter em venda?')) return;

    try {
      // 1. Criar a nova venda
      const commissionValue = (parseFloat(quote.value) * parseFloat(quote.commission_percentage)) / 100;
      const saleData = {
        user_id: quote.user_id,
        client_id: quote.client_id,
        product_service: quote.product_service,
        value: quote.value,
        commission_percentage: quote.commission_percentage,
        commission_value: commissionValue,
        sale_date: new Date().toISOString().split('T')[0], // Hoje
      };

      const { error: saleError } = await supabase.from('sales').insert([saleData]);
      if (saleError) throw saleError;

      // 2. Atualizar o status do orçamento para 'aceito'
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'aceito' })
        .eq('id', quote.id);
      if (quoteError) throw quoteError;

      alert('Orçamento convertido em venda com sucesso!');
      loadQuotes(); // Recarrega a lista de orçamentos
    } catch (error) {
      console.error('Erro ao converter orçamento para venda:', error);
      alert('Erro ao converter orçamento: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Orçamentos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Novo Orçamento'}
        </button>
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
                <label>Data do Orçamento *</label>
                <input
                type="date"
                value={formData.quote_date}
                onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                required
                />
            </div>

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
            {quotes.map((quote) => (
            <div key={quote.id} className={`item-card quote-card status-${quote.status}`}>
                <h3>{quote.product_service}</h3>
                <div className="item-details">
                    {quote.clients && <span>👤 {quote.clients.name}</span>}
                    <span>💰 Valor: R$ {parseFloat(quote.value).toFixed(2)}</span>
                    <span>📊 Comissão: {quote.commission_percentage}%</span>
                    <span>📅 {new Date(quote.quote_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    <span className="quote-status">Status: {quote.status}</span>
                </div>
                <div className="item-actions">
                {quote.status === 'pendente' && (
                    <button onClick={() => handleConvertToSale(quote)} className="btn-convert">
                    Converter em Venda
                    </button>
                )}
                <button onClick={() => handleEdit(quote)} className="btn-edit">
                    Editar
                </button>
                <button onClick={() => handleDelete(quote.id)} className="btn-delete">
                    Excluir
                </button>
                </div>
            </div>
            ))}
        </div>

    </div>
  );
};

export default Quotes;
