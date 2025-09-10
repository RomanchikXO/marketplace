import React, { useState, useEffect, useCallback } from 'react';
import './WbLkManager.css';

interface WbLk {
  id: number;
  name: string;
  token: string;
  number?: number;
  cookie?: string;
  authorizev3?: string;
  inn?: number;
  tg_id?: number;
  owner_id: number;
  is_owner: boolean;
}

interface User {
  id: number;
  nickname: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  wb_lks: WbLk[];
}

interface WbLkManagerProps {
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
}

const WbLkManager: React.FC<WbLkManagerProps> = ({ user, onUserUpdate }) => {
  const [wbLks, setWbLks] = useState<WbLk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareForm, setShowShareForm] = useState<number | null>(null);
  const [shareUserId, setShareUserId] = useState<string>('');
  const [showManageUsers, setShowManageUsers] = useState<number | null>(null);
  const [wbLkUsers, setWbLkUsers] = useState<{[key: number]: any[]}>({});
  const [newWbLk, setNewWbLk] = useState({
    name: '',
    token: '',
    number: '',
    cookie: '',
    authorizev3: '',
    inn: '',
    tg_id: ''
  });

  const fetchWbLks = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiUrl}/wb-lk`, {
        headers: {
          'X-User-ID': user.id.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки WB личных кабинетов');
      }

      const data = await response.json();
      setWbLks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchWbLks();
  }, [fetchWbLks]);

  const handleAddWbLk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiUrl}/wb-lk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString(),
        },
        body: JSON.stringify({
          name: newWbLk.name,
          token: newWbLk.token,
          number: newWbLk.number ? parseInt(newWbLk.number) : null,
          cookie: newWbLk.cookie || null,
          authorizev3: newWbLk.authorizev3 || null,
          inn: newWbLk.inn ? parseInt(newWbLk.inn) : null,
          tg_id: newWbLk.tg_id ? parseInt(newWbLk.tg_id) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания WB личного кабинета');
      }

      const data = await response.json();
      setWbLks([...wbLks, data]);
      
      // Обновляем профиль пользователя
      if (onUserUpdate) {
        const updatedUser = { ...user, wb_lks: [...user.wb_lks, data] };
        onUserUpdate(updatedUser);
      }
      
      setNewWbLk({
        name: '',
        token: '',
        number: '',
        cookie: '',
        authorizev3: '',
        inn: '',
        tg_id: ''
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleShareWbLk = async (wbLkId: number) => {
    if (!shareUserId.trim()) {
      setError('Введите ID пользователя');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiUrl}/wb-lk/${wbLkId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString(),
        },
        body: JSON.stringify({
          user_id: parseInt(shareUserId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка предоставления доступа');
      }

      const data = await response.json();
      alert(data.message);
      setShareUserId('');
      setShowShareForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };


  const handleManageUsers = async (wbLkId: number) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiUrl}/wb-lk/${wbLkId}/users`, {
        headers: {
          'X-User-ID': user.id.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки списка пользователей');
      }

      const data = await response.json();
      setWbLkUsers({...wbLkUsers, [wbLkId]: data.users});
      setShowManageUsers(showManageUsers === wbLkId ? null : wbLkId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleRevokeAccess = async (wbLkId: number, userId: number) => {
    if (!window.confirm('Вы уверены, что хотите отозвать доступ?')) {
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiUrl}/wb-lk/${wbLkId}/unshare/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-User-ID': user.id.toString(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка отзыва доступа');
      }

      const data = await response.json();
      alert(data.message);
      
      // Обновляем список пользователей
      handleManageUsers(wbLkId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  if (loading) {
    return (
      <div className="wb-lk-manager">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="wb-lk-manager">
      <div className="wb-lk-header">
        <h2>Управление WB личными кабинетами</h2>
        <div className="user-info">
          <div className="user-id">Ваш ID: <strong>{user.id}</strong></div>
          <div className="user-nickname">Пользователь: <strong>{user.nickname}</strong></div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="wb-lk-actions">
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Отмена' : '+ Добавить WB личный кабинет'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Добавить новый WB личный кабинет</h3>
          <form onSubmit={handleAddWbLk}>
            <div className="form-group">
              <label>Название *</label>
              <input
                type="text"
                value={newWbLk.name}
                onChange={(e) => setNewWbLk({...newWbLk, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Токен *</label>
              <input
                type="text"
                value={newWbLk.token}
                onChange={(e) => setNewWbLk({...newWbLk, token: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Номер</label>
              <input
                type="number"
                value={newWbLk.number}
                onChange={(e) => setNewWbLk({...newWbLk, number: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Cookie</label>
              <textarea
                value={newWbLk.cookie}
                onChange={(e) => setNewWbLk({...newWbLk, cookie: e.target.value})}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Authorize v3</label>
              <textarea
                value={newWbLk.authorizev3}
                onChange={(e) => setNewWbLk({...newWbLk, authorizev3: e.target.value})}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>ИНН</label>
              <input
                type="number"
                value={newWbLk.inn}
                onChange={(e) => setNewWbLk({...newWbLk, inn: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Telegram ID</label>
              <input
                type="number"
                value={newWbLk.tg_id}
                onChange={(e) => setNewWbLk({...newWbLk, tg_id: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Создать</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="wb-lk-list">
        <h3>Ваши WB личные кабинеты ({wbLks.length})</h3>
        {wbLks.length === 0 ? (
          <div className="no-lks">У вас пока нет WB личных кабинетов</div>
        ) : (
          wbLks.map((wbLk) => (
            <div key={wbLk.id} className="wb-lk-card">
              <div className="wb-lk-info">
                <h4>{wbLk.name}</h4>
                <div className="wb-lk-details">
                  <div><strong>ID:</strong> {wbLk.id}</div>
                  <div className={`ownership-badge ${wbLk.is_owner ? 'owner' : 'shared'}`}>
                    {wbLk.is_owner ? '👑 Владелец' : '👥 Общий доступ'}
                  </div>
                  {wbLk.number && <div><strong>Номер:</strong> {wbLk.number}</div>}
                  {wbLk.inn && <div><strong>ИНН:</strong> {wbLk.inn}</div>}
                  {wbLk.tg_id && <div><strong>Telegram ID:</strong> {wbLk.tg_id}</div>}
                </div>
              </div>
              {wbLk.is_owner && (
                <div className="wb-lk-actions">
                  <button 
                    className="share-btn"
                    onClick={() => setShowShareForm(showShareForm === wbLk.id ? null : wbLk.id)}
                  >
                    Поделиться
                  </button>
                  <button 
                    className="manage-btn"
                    onClick={() => handleManageUsers(wbLk.id)}
                  >
                    Управление доступом
                  </button>
                </div>
              )}
              
              {showShareForm === wbLk.id && (
                <div className="share-form">
                  <h5>Поделиться с пользователем</h5>
                  <div className="share-input-group">
                    <input
                      type="number"
                      placeholder="ID пользователя"
                      value={shareUserId}
                      onChange={(e) => setShareUserId(e.target.value)}
                    />
                    <button 
                      onClick={() => handleShareWbLk(wbLk.id)}
                      className="share-submit-btn"
                    >
                      Предоставить доступ
                    </button>
                  </div>
                </div>
              )}

              {showManageUsers === wbLk.id && (
                <div className="manage-users-form">
                  <h5>Управление доступом к "{wbLk.name}"</h5>
                  <div className="users-list">
                    {wbLkUsers[wbLk.id]?.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-info">
                          <span className="user-name">{user.nickname}</span>
                          <span className="user-email">({user.email})</span>
                          {user.is_owner && <span className="owner-badge">👑 Владелец</span>}
                        </div>
                        {!user.is_owner && (
                          <button 
                            className="revoke-btn"
                            onClick={() => handleRevokeAccess(wbLk.id, user.id)}
                          >
                            Отозвать доступ
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WbLkManager;
