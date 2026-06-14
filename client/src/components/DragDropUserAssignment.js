import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Drag-and-drop user assignment component.
 * Props:
 *  - allUsers: Array of { id, fullName, username, role }
 *  - assignedUserIds: Array of user IDs (ordered)
 *  - onChange: (newAssignedIds: string[]) => void
 */
export default function DragDropUserAssignment({ allUsers = [], assignedUserIds = [], onChange }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOver, setDragOver] = useState(null); // 'available' | 'assigned' | null
  // eslint-disable-next-line no-unused-vars
  const [particles, setParticles] = useState([]);
  const dropRef = useRef(null);
  const particleKey = useRef(0);

  const assigned = assignedUserIds
    .map((id) => allUsers.find((u) => u.id === id))
    .filter(Boolean);
  const available = allUsers.filter((u) => !assignedUserIds.includes(u.id));

  const handleDragStart = useCallback((e, userId) => {
    setDraggedId(userId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', userId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOver(null);
  }, []);

  const spawnParticles = useCallback((x, y) => {
    const count = 8;
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      particleKey.current += 1;
      newParticles.push({
        id: particleKey.current,
        x,
        y,
        angle: (360 / count) * i + Math.random() * 30,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 700);
  }, []);

  const handleDropOnAssigned = useCallback(
    (e) => {
      e.preventDefault();
      const userId = e.dataTransfer.getData('text/plain');
      if (!userId) return;
      setDragOver(null);

      if (!assignedUserIds.includes(userId)) {
        const newIds = [...assignedUserIds, userId];
        onChange(newIds);
        // Spawn particles at drop position
        const rect = dropRef.current?.getBoundingClientRect();
        if (rect) {
          spawnParticles(e.clientX - rect.left, e.clientY - rect.top);
        }
      }
    },
    [assignedUserIds, onChange, spawnParticles]
  );

  const handleDropOnAvailable = useCallback(
    (e) => {
      e.preventDefault();
      const userId = e.dataTransfer.getData('text/plain');
      if (!userId) return;
      setDragOver(null);
      if (assignedUserIds.includes(userId)) {
        onChange(assignedUserIds.filter((id) => id !== userId));
      }
    },
    [assignedUserIds, onChange]
  );

  const handleRemoveUser = useCallback(
    (userId) => {
      onChange(assignedUserIds.filter((id) => id !== userId));
    },
    [assignedUserIds, onChange]
  );

  const handleAddUser = useCallback(
    (userId) => {
      if (!assignedUserIds.includes(userId)) {
        onChange([...assignedUserIds, userId]);
      }
    },
    [assignedUserIds, onChange]
  );

  const handleDragOverAssigned = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver('assigned');
  }, []);

  const handleDragOverAvailable = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver('available');
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  // Reorder within assigned
  const handleReorderDrop = useCallback(
    (e, targetIdx) => {
      e.preventDefault();
      e.stopPropagation();
      const userId = e.dataTransfer.getData('text/plain');
      if (!userId || !assignedUserIds.includes(userId)) return;

      const currentIdx = assignedUserIds.indexOf(userId);
      if (currentIdx === targetIdx) return;

      const newIds = [...assignedUserIds];
      newIds.splice(currentIdx, 1);
      newIds.splice(targetIdx, 0, userId);
      onChange(newIds);
    },
    [assignedUserIds, onChange]
  );

  return (
    <div className="ft-dnd">
      <div className="ft-dnd__columns">
        {/* Available users */}
        <div
          className={`ft-dnd__column ${dragOver === 'available' ? 'ft-dnd__column--active' : ''}`}
          onDragOver={handleDragOverAvailable}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnAvailable}
        >
          <h4 className="ft-dnd__column-title">Tüm Kullanıcılar</h4>
          <div className="ft-dnd__list">
            {available.length === 0 && (
              <p className="ft-dnd__empty">Tüm kullanıcılar atandı</p>
            )}
            <AnimatePresence mode="popLayout">
              {available.map((user) => (
                <motion.div
                  key={user.id}
                  className={`ft-dnd__card ${draggedId === user.id ? 'ft-dnd__card--dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, user.id)}
                  onDragEnd={handleDragEnd}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <span className="ft-dnd__avatar">
                    {(user.fullName || '?')[0].toUpperCase()}
                  </span>
                  <div className="ft-dnd__card-info">
                    <span className="ft-dnd__card-name">{user.fullName}</span>
                    <span className={`ft-role-badge ft-role-badge--${user.role} ft-role-badge--mini`}>
                      {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ft-btn ft-btn--ghost ft-btn--sm ft-dnd__add-btn"
                    onClick={() => handleAddUser(user.id)}
                    title="Ekle"
                  >
                    +
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Assigned users */}
        <div
          ref={dropRef}
          className={`ft-dnd__column ft-dnd__column--assigned ${
            dragOver === 'assigned' ? 'ft-dnd__column--active' : ''
          }`}
          onDragOver={handleDragOverAssigned}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnAssigned}
        >
          <h4 className="ft-dnd__column-title">
            Projede Çalışanlar
            {assigned.length > 0 && (
              <span className="ft-dnd__count">{assigned.length}</span>
            )}
          </h4>
          <div className="ft-dnd__list">
            {assigned.length === 0 && (
              <p className="ft-dnd__empty ft-dnd__empty--drop">
                Kullanıcıları buraya sürükleyin
              </p>
            )}
            <AnimatePresence mode="popLayout">
              {assigned.map((user, idx) => (
                <motion.div
                  key={user.id}
                  className={`ft-dnd__card ft-dnd__card--assigned ${
                    draggedId === user.id ? 'ft-dnd__card--dragging' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, user.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => handleReorderDrop(e, idx)}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -30 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <span className="ft-dnd__order">{idx + 1}</span>
                  <span className="ft-dnd__avatar">
                    {(user.fullName || '?')[0].toUpperCase()}
                  </span>
                  <div className="ft-dnd__card-info">
                    <span className="ft-dnd__card-name">{user.fullName}</span>
                    <span className={`ft-role-badge ft-role-badge--${user.role} ft-role-badge--mini`}>
                      {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ft-btn ft-btn--icon ft-dnd__remove-btn"
                    onClick={() => handleRemoveUser(user.id)}
                    aria-label="Çıkar"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Particle effects */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="ft-dnd__particle"
              style={{
                left: p.x,
                top: p.y,
                '--angle': `${p.angle}deg`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
