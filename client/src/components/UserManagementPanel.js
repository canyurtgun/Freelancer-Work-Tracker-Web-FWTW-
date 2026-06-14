import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import UserFormModal from './UserFormModal';
import * as api from '../api';

export default function UserManagementPanel({ open, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetInfo, setResetInfo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchUsers();
  }, [open, fetchUsers]);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setEditing(user);
    setFormOpen(true);
  }, []);

  const handleFormSave = useCallback(async (data, id) => {
    try {
      if (id) {
        await api.updateUser(id, data);
      } else {
        const result = await api.createUser(data);
        if (result.generatedPassword) {
          setResetInfo({ password: result.generatedPassword, fullName: result.user.fullName });
        }
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      window.alert(err.message);
    }
  }, [fetchUsers]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.deleteUser(id);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      window.alert(err.message);
    }
  }, [fetchUsers]);

  const handleResetPassword = useCallback(async (id) => {
    try {
      const result = await api.resetPassword(id, { autoGenerate: true });
      if (result.generatedPassword) {
        const user = users.find((u) => u.id === id);
        setResetInfo({ password: result.generatedPassword, fullName: user?.fullName || '' });
      }
    } catch (err) {
      window.alert(err.message);
    }
  }, [users]);

  return (
    <>
      <Modal open={open} onClose={onClose} title="Kullanıcı Yönetimi" size="lg">
        <div className="ft-usermgmt">
          <div className="ft-usermgmt__toolbar">
            <p className="ft-usermgmt__count">
              {users.length} kullanıcı
            </p>
            <button
              type="button"
              className="ft-btn ft-btn--primary ft-btn--sm"
              onClick={handleCreate}
            >
              + Yeni kullanıcı
            </button>
          </div>

          {loading ? (
            <div className="ft-usermgmt__loading">
              <span className="ft-login-spinner" />
            </div>
          ) : users.length === 0 ? (
            <p className="ft-usermgmt__empty">Henüz kullanıcı yok.</p>
          ) : (
            <div className="ft-usermgmt__table-wrap">
              <table className="ft-usermgmt__table">
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Kullanıcı Adı</th>
                    <th>Rol</th>
                    <th>Projeler</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {users.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ delay: idx * 0.04 }}
                        className="ft-usermgmt__row"
                      >
                        <td>
                          <div className="ft-usermgmt__user-info">
                            <span className="ft-usermgmt__avatar">
                              {(user.fullName || '?')[0].toUpperCase()}
                            </span>
                            <span>{user.fullName}</span>
                          </div>
                        </td>
                        <td><code className="ft-usermgmt__username">@{user.username}</code></td>
                        <td>
                          <span className={`ft-role-badge ft-role-badge--${user.role}`}>
                            {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                          </span>
                        </td>
                        <td>{user._count?.projects ?? 0}</td>
                        <td>
                          <div className="ft-usermgmt__actions">
                            <button
                              type="button"
                              className="ft-btn ft-btn--ghost ft-btn--sm"
                              onClick={() => handleEdit(user)}
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              className="ft-btn ft-btn--ghost ft-btn--sm"
                              onClick={() => handleResetPassword(user.id)}
                            >
                              Şifre sıfırla
                            </button>
                            <button
                              type="button"
                              className="ft-btn ft-btn--danger ft-btn--sm"
                              onClick={() => setDeleteConfirm(user)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        onSave={handleFormSave}
      />

      {/* Reset password info modal */}
      <Modal
        open={!!resetInfo}
        onClose={() => setResetInfo(null)}
        title="Şifre Bilgisi"
        size="sm"
      >
        {resetInfo && (
          <div className="ft-reset-info">
            <p>
              <strong>{resetInfo.fullName}</strong> için yeni şifre:
            </p>
            <div className="ft-reset-info__password">
              <code>{resetInfo.password}</code>
              <button
                type="button"
                className="ft-btn ft-btn--ghost ft-btn--sm"
                onClick={() => {
                  navigator.clipboard.writeText(resetInfo.password);
                }}
              >
                Kopyala
              </button>
            </div>
            <p className="ft-reset-info__warn">
              Bu şifreyi not edin — tekrar görüntülenemez.
            </p>
            <div className="ft-form-actions">
              <button
                type="button"
                className="ft-btn ft-btn--primary"
                onClick={() => setResetInfo(null)}
              >
                Tamam
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Kullanıcı Sil"
        size="sm"
      >
        {deleteConfirm && (
          <div className="ft-delete-confirm">
            <p>
              <strong>{deleteConfirm.fullName}</strong> ({deleteConfirm.username}) kullanıcısını
              silmek istediğinize emin misiniz?
            </p>
            <div className="ft-form-actions">
              <button
                type="button"
                className="ft-btn ft-btn--ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="ft-btn ft-btn--danger"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Sil
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
