import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/SupabaseClient';
import { useAuth } from '../../lib/AuthContext';
import '../Meetings/Meetings.css';
import './Clients.css';

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_info: '',
    address: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user, loadClients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('clients').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clients').insert([{ ...formData, user_id: user.id }]);
        if (error) throw error;
      }
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente: ' + error.message);
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      contact_info: client.contact_info || '',
      address: client.address || '',
    });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      loadClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', contact_info: '', address: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.contact_info && client.contact_info.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderClientCard = (client) => (
    <div key={client.id} className="item-card">
      <h3>{client.name}</h3>
      <div className="item-details">
        {client.contact_info && <span>📞 {client.contact_info}</span>}
        {client.address && <span>📍 {client.address}</span>}
      </div>
      <div className="item-actions">
        <button onClick={() => handleEdit(client)} className="btn-edit">Editar</button>
        <button onClick={() => handleDelete(client.id)} className="btn-delete">Excluir</button>
      </div>
    </div>
  );

  const renderClientListItem = (client) => (
    <div key={client.id} className="item-card-list">
        <div className="item-details-list">
            <h3>{client.name}</h3>
            {client.contact_info && <span>📞 {client.contact_info}</span>}
            {client.address && <span>📍 {client.address}</span>}
        </div>
        <div className="item-actions-list">
            <button onClick={() => handleEdit(client)} className="btn-edit">Editar</button>
            <button onClick={() => handleDelete(client.id)} className="btn-delete">Excluir</button>
        </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Clientes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
            <div className="form-group"><label>Nome *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Contato</label><input type="text" value={formData.contact_info} onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })} placeholder="Telefone, e-mail, etc." /></div>
            <div className="form-group"><label>Endereço</label><textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="3" /></div>
            <div className="form-actions">
                <button type="submit" className="btn-primary">{editingId ? 'Atualizar' : 'Criar'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
            </div>
        </form>
      )}

    <div className="toolbar">
        <div className="search-bar">
            <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="view-toggle">
            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>Grade</button>
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button>
        </div>
    </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filteredClients.length === 0 ? (
        <p className="empty-message">Nenhum cliente encontrado.</p>
      ) : viewMode === 'grid' ? (
        <div className="items-grid">
          {filteredClients.map(renderClientCard)}
        </div>
      ) : (
        <div className="items-list">
          {filteredClients.map(renderClientListItem)}
        </div>
      )}
    </div>
  );
};

export default Clients;
