import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  EXTRA_STATUS,
  EXTRA_STATUS_LABELS,
} from '../constants';
import DragDropUserAssignment from './DragDropUserAssignment';

function newExtra() {
  return {
    id: crypto.randomUUID(),
    label: '',
    price: '',
    status: EXTRA_STATUS.PENDING,
  };
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    title: '',
    customerName: '',
    content: '',
    price: '',
    deposit: '',
    startDate: todayString(),
    deliveryDate: '',
    status: PROJECT_STATUS.PLANNING,
    notes: '',
    extras: [],
    assignedUsers: [],
  };
}

function projectToForm(p) {
  if (!p) return emptyForm();
  return {
    title: p.title || '',
    customerName: p.customerName || '',
    content: p.content || '',
    price: p.price != null ? String(p.price) : '',
    deposit: p.deposit != null ? String(p.deposit) : '',
    startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '',
    deliveryDate: p.deliveryDate ? new Date(p.deliveryDate).toISOString().slice(0, 10) : '',
    status: p.status || PROJECT_STATUS.PLANNING,
    notes: p.notes || '',
    extras: (p.extras || []).map((e) => ({
      id: e.id || crypto.randomUUID(),
      label: e.label || '',
      price: e.price != null ? String(e.price) : '',
      status: e.status || EXTRA_STATUS.PENDING,
    })),
    assignedUsers: (p.users || []).map((u) => u.id),
  };
}

function parseNum(s) {
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function ProjectFormModal({ open, onClose, editing, onSubmit, allUsers = [] }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) setForm(projectToForm(editing));
  }, [open, editing]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const addExtra = () => setForm((f) => ({ ...f, extras: [...f.extras, newExtra()] }));

  const updateExtra = (id, patch) => {
    setForm((f) => ({
      ...f,
      extras: f.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const removeExtra = (id) => {
    setForm((f) => ({ ...f, extras: f.extras.filter((e) => e.id !== id) }));
  };

  const handleAssignedUsersChange = useCallback((newIds) => {
    setForm((f) => ({ ...f, assignedUsers: newIds }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      customerName: form.customerName.trim(),
      content: form.content.trim(),
      price: parseNum(form.price),
      deposit: parseNum(form.deposit),
      startDate: form.startDate
        ? new Date(form.startDate + 'T12:00:00').toISOString()
        : '',
      deliveryDate: form.deliveryDate
        ? new Date(form.deliveryDate + 'T12:00:00').toISOString()
        : '',
      status: form.status,
      notes: form.notes.trim(),
      extras: form.extras.map((ex) => ({
        id: ex.id,
        label: ex.label.trim(),
        price: parseNum(ex.price),
        status: ex.status,
      })),
      assignedUsers: form.assignedUsers,
    };
    if (!payload.title) {
      window.alert('Proje başlığı zorunludur.');
      return;
    }
    onSubmit(payload, editing?.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ft-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="presentation"
            className="ft-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="ft-modal-dialog ft-modal-dialog--lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ft-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="ft-modal-head">
              <h2 id="ft-modal-title">{editing ? 'Projeyi düzenle' : 'Yeni proje'}</h2>
              <button type="button" className="ft-modal-close" onClick={onClose} aria-label="Kapat">
                ×
              </button>
            </div>
            <form className="ft-form" onSubmit={handleSubmit}>
              <div className="ft-form__grid">
                <label className="ft-field">
                  <span>Proje başlığı *</span>
                  <input
                    className="ft-input"
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    required
                    maxLength={200}
                  />
                </label>
                <label className="ft-field">
                  <span>Müşteri adı</span>
                  <input
                    className="ft-input"
                    value={form.customerName}
                    onChange={(e) => setField('customerName', e.target.value)}
                    maxLength={120}
                  />
                </label>
                <label className="ft-field ft-field--full">
                  <span>Proje içeriği / kapsam</span>
                  <textarea
                    className="ft-textarea"
                    rows={4}
                    value={form.content}
                    onChange={(e) => setField('content', e.target.value)}
                    placeholder="Ne teslim edilecek, hangi teknolojiler, kapsam notları..."
                  />
                </label>
                <label className="ft-field">
                  <span>Anlaşılan fiyat (₺)</span>
                  <input
                    className="ft-input"
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                  />
                </label>
                <label className="ft-field">
                  <span>Depozito / ön ödeme (₺)</span>
                  <input
                    className="ft-input"
                    type="text"
                    inputMode="decimal"
                    value={form.deposit}
                    onChange={(e) => setField('deposit', e.target.value)}
                  />
                </label>
                <label className="ft-field">
                  <span>Başlangıç tarihi</span>
                  <input
                    className="ft-input"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setField('startDate', e.target.value)}
                  />
                </label>
                <label className="ft-field">
                  <span>Teslim tarihi</span>
                  <input
                    className="ft-input"
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => setField('deliveryDate', e.target.value)}
                  />
                </label>
                <label className="ft-field">
                  <span>Durum</span>
                  <select
                    className="ft-select ft-select--full"
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                  >
                    {Object.values(PROJECT_STATUS).map((s) => (
                      <option key={s} value={s}>
                        {PROJECT_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ft-field ft-field--full">
                  <span>Notlar</span>
                  <textarea
                    className="ft-textarea"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    placeholder="İç notlar, hatırlatmalar..."
                  />
                </label>
              </div>

              {/* User assignment with drag & drop */}
              {allUsers.length > 0 && (
                <div className="ft-extras-section">
                  <div className="ft-extras-head">
                    <h3>Çalışan Ataması</h3>
                  </div>
                  <p className="ft-extras-hint">
                    Kullanıcıları sürükleyip bırakarak projeye atayın.
                  </p>
                  <DragDropUserAssignment
                    allUsers={allUsers}
                    assignedUserIds={form.assignedUsers}
                    onChange={handleAssignedUsersChange}
                  />
                </div>
              )}

              <div className="ft-extras-section">
                <div className="ft-extras-head">
                  <h3>Ekstra istekler</h3>
                  <button type="button" className="ft-btn ft-btn--ghost ft-btn--sm" onClick={addExtra}>
                    + Satır ekle
                  </button>
                </div>
                <p className="ft-extras-hint">
                  Sonradan eklenen işler için fiyat ve durumu ayrı takip edin.
                </p>
                <div className="ft-extras-rows">
                  {form.extras.length === 0 && (
                    <p className="ft-extras-empty">Henüz ekstra satırı yok.</p>
                  )}
                  {form.extras.map((ex, idx) => (
                    <motion.div
                      key={ex.id}
                      className="ft-extra-row"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <input
                        className="ft-input"
                        placeholder="Açıklama"
                        value={ex.label}
                        onChange={(e) => updateExtra(ex.id, { label: e.target.value })}
                      />
                      <input
                        className="ft-input ft-input--narrow"
                        placeholder="₺"
                        inputMode="decimal"
                        value={ex.price}
                        onChange={(e) => updateExtra(ex.id, { price: e.target.value })}
                      />
                      <select
                        className="ft-select"
                        value={ex.status}
                        onChange={(e) => updateExtra(ex.id, { status: e.target.value })}
                      >
                        {Object.values(EXTRA_STATUS).map((s) => (
                          <option key={s} value={s}>
                            {EXTRA_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="ft-btn ft-btn--icon"
                        onClick={() => removeExtra(ex.id)}
                        aria-label="Satırı sil"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="ft-form-actions">
                <button type="button" className="ft-btn ft-btn--ghost" onClick={onClose}>
                  Vazgeç
                </button>
                <button type="submit" className="ft-btn ft-btn--primary">
                  {editing ? 'Kaydet' : 'Projeyi ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
