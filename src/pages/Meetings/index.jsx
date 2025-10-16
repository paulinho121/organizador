import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/SupabaseClient';
import { useAuth } from '../../lib/AuthContext';
import './Meetings.css';

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pauta: '', // Adicionado para a pauta da reunião
    date: '',
    time: '',
    client_id: '',
  });
  const [editingId, setEditingId] = useState(null);

  const loadMeetings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error);
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
      loadMeetings();
      loadClients();
    }
  }, [user, loadMeetings, loadClients]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('meetings')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meetings')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
      }

      resetForm();
      loadMeetings();
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
      alert('Erro ao salvar reunião: ' + error.message);
    }
  };

  const handleEdit = (meeting) => {
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      pauta: meeting.pauta || '',
      date: meeting.date,
      time: meeting.time,
      client_id: meeting.client_id || '',
    });
    setEditingId(meeting.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta reunião?')) return;

    try {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
      loadMeetings();
    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      pauta: '',
      date: '',
      time: '',
      client_id: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reuniões</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Nova Reunião'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Pauta</label>
            <textarea
              value={formData.pauta}
              onChange={(e) => setFormData({ ...formData, pauta: e.target.value })}
              rows="5"
              placeholder="Digite os tópicos da reunião, um por linha."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Hora *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

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
        {meetings.length === 0 ? (
          <p className="empty-message">Nenhuma reunião cadastrada.</p>
        ) : (
          meetings.map((meeting) => (
            <MeetingItem
              key={meeting.id}
              meeting={meeting}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Componente para cada item da reunião com cronômetro
const MeetingItem = ({ meeting, onEdit, onDelete }) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const countRef = React.useRef(null);

  const startTimer = () => {
    setIsActive(true);
    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(countRef.current);
    setIsActive(false);
  };

  const formatTime = (time) => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <div className="item-card">
      <h3>{meeting.title}</h3>
      {meeting.description && <p className="item-description">{meeting.description}</p>}
      
      {meeting.pauta && (
        <div className="pauta-section">
          <h4>Pauta da Reunião:</h4>
          <ul>
            {meeting.pauta.split('\n').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="item-details">
        <span>📅 {new Date(meeting.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
        <span>🕐 {meeting.time}</span>
        {meeting.clients && <span>👤 {meeting.clients.name}</span>}
      </div>

      <div className="stopwatch-container">
        <p className="timer-display">{formatTime(timer)}</p>
        <div className="timer-controls">
          {!isActive ? (
            <button onClick={startTimer} className="btn-start">
              Iniciar
            </button>
          ) : (
            <button onClick={stopTimer} className="btn-stop">
              Encerrar
            </button>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button onClick={() => onEdit(meeting)} className="btn-edit">
          Editar
        </button>
        <button onClick={() => onDelete(meeting.id)} className="btn-delete">
          Excluir
        </button>
      </div>
    </div>
  );
};

export default Meetings;
