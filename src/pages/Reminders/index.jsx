import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import '../Meetings/Meetings.css';
import './Reminders.css';

const Reminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('reminders')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert([{ ...formData, user_id: user.id, is_completed: false }]);

        if (error) throw error;
      }

      resetForm();
      loadReminders();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
      alert('Erro ao salvar lembrete: ' + error.message);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadReminders();
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
    }
  };

  const handleEdit = (reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      due_date: reminder.due_date || '',
    });
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lembrete?')) return;

    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      loadReminders();
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  const pendingReminders = reminders.filter((r) => !r.is_completed);
  const completedReminders = reminders.filter((r) => r.is_completed);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lembretes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Novo Lembrete'}
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
            <label>Data de Vencimento</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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

      <div className="reminders-section">
        <h2>Pendentes ({pendingReminders.length})</h2>
        <div className="items-grid">
          {pendingReminders.length === 0 ? (
            <p className="empty-message">Nenhum lembrete pendente.</p>
          ) : (
            pendingReminders.map((reminder) => (
              <div key={reminder.id} className="reminder-card">
                <div className="reminder-header">
                  <input
                    type="checkbox"
                    checked={reminder.is_completed}
                    onChange={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                    className="reminder-checkbox"
                  />
                  <h3>{reminder.title}</h3>
                </div>
                {reminder.description && <p className="item-description">{reminder.description}</p>}
                {reminder.due_date && (
                  <div className="item-details">
                    <span>📅 {new Date(reminder.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="item-actions">
                  <button onClick={() => handleEdit(reminder)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(reminder.id)} className="btn-delete">
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {completedReminders.length > 0 && (
        <div className="reminders-section">
          <h2>Concluídos ({completedReminders.length})</h2>
          <div className="items-grid">
            {completedReminders.map((reminder) => (
              <div key={reminder.id} className="reminder-card completed">
                <div className="reminder-header">
                  <input
                    type="checkbox"
                    checked={reminder.is_completed}
                    onChange={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                    className="reminder-checkbox"
                  />
                  <h3>{reminder.title}</h3>
                </div>
                {reminder.description && <p className="item-description">{reminder.description}</p>}
                {reminder.due_date && (
                  <div className="item-details">
                    <span>📅 {new Date(reminder.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="item-actions">
                  <button onClick={() => handleDelete(reminder.id)} className="btn-delete">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;

