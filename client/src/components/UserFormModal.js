import { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';

function generateLocalPassword(length = 12) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let pass = '';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    pass += chars[arr[i] % chars.length];
  }
  return pass;
}

export default function UserFormModal({ open, onClose, editing, onSave }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const generatedPassword = useMemo(
    () => (open && !editing ? generateLocalPassword() : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setFullName(editing.fullName || '');
      setUsername(editing.username || '');
      setRole(editing.role || 'user');
      setAutoGenerate(false);
      setPassword('');
    } else {
      setFullName('');
      setUsername('');
      setRole('user');
      setAutoGenerate(true);
      setPassword('');
    }
  }, [open, editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      window.alert('Ad soyad ve kullanıcı adı gerekli');
      return;
    }
    setSaving(true);
    const data = {
      fullName: fullName.trim(),
      username: username.trim(),
      role,
    };
    if (!editing) {
      data.autoGenerate = autoGenerate;
      if (!autoGenerate) {
        data.password = password;
      }
    }
    try {
      await onSave(data, editing?.id);
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editing;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
      size="sm"
    >
      <form className="ft-user-form" onSubmit={handleSubmit}>
        <div className="ft-login-field">
          <label htmlFor="uf-name">Ad Soyad *</label>
          <input
            id="uf-name"
            className="ft-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={saving}
            autoFocus
          />
        </div>
        <div className="ft-login-field">
          <label htmlFor="uf-username">Kullanıcı adı *</label>
          <input
            id="uf-username"
            className="ft-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div className="ft-login-field">
          <label htmlFor="uf-role">Rol</label>
          <select
            id="uf-role"
            className="ft-select ft-select--full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={saving}
          >
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {!isEditing && (
          <>
            <div className="ft-login-field">
              <label className="ft-user-form__toggle">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                />
                <span>Şifreyi otomatik oluştur</span>
              </label>
            </div>
            {autoGenerate ? (
              <div className="ft-reset-info__password" style={{ marginBottom: '1rem' }}>
                <code>{generatedPassword}</code>
                <button
                  type="button"
                  className="ft-btn ft-btn--ghost ft-btn--sm"
                  onClick={() => navigator.clipboard.writeText(generatedPassword)}
                >
                  Kopyala
                </button>
              </div>
            ) : (
              <div className="ft-login-field">
                <label htmlFor="uf-pass">Şifre *</label>
                <input
                  id="uf-pass"
                  className="ft-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={4}
                  required={!autoGenerate}
                  disabled={saving}
                />
              </div>
            )}
          </>
        )}
        <div className="ft-form-actions">
          <button type="button" className="ft-btn ft-btn--ghost" onClick={onClose} disabled={saving}>
            Vazgeç
          </button>
          <button type="submit" className="ft-btn ft-btn--primary" disabled={saving}>
            {saving ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
