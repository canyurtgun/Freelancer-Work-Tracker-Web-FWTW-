import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AlertsModal from './AlertsModal';
import UserManagementPanel from './UserManagementPanel';

const headerVariants = {
  hidden: { opacity: 0, y: -24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const actionsVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const actionItem = {
  hidden: { opacity: 0, y: -10, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function Header({ onExport }) {
  const { user, isAdmin, logout } = useAuth();
  const [userMgmtOpen, setUserMgmtOpen] = useState(false);

  return (
    <>
      <motion.header
        className="ft-header"
        variants={headerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="ft-header__brand">
          <motion.span
            className="ft-header__logo"
            aria-hidden
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          >
            ◆
          </motion.span>
          <div>
            <h1 className="ft-header__title">Freelance İş Takip</h1>
            <p className="ft-header__subtitle">
              Projelerinizi, teslimleri ve kazançlarınızı tek panelden yönetin
            </p>
          </div>
        </div>
        <motion.div
          className="ft-header__actions"
          variants={actionsVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={actionItem}>
            <AlertsModal />
          </motion.div>
          {isAdmin && (
            <motion.button
              type="button"
              className="ft-btn ft-btn--ghost"
              onClick={() => setUserMgmtOpen(true)}
              variants={actionItem}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              👥 Kullanıcılar
            </motion.button>
          )}
          {isAdmin && (
            <motion.button
              type="button"
              className="ft-btn ft-btn--secondary"
              onClick={onExport}
              variants={actionItem}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              JSON dışa aktar
            </motion.button>
          )}
          <motion.div className="ft-header__user" variants={actionItem}>
            <motion.span
              className="ft-header__user-avatar"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              {(user?.fullName || '?')[0].toUpperCase()}
            </motion.span>
            <span className="ft-header__user-name">{user?.fullName || user?.username}</span>
            <motion.button
              type="button"
              className="ft-btn ft-btn--ghost ft-btn--sm"
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Çıkış
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.header>

      <UserManagementPanel open={userMgmtOpen} onClose={() => setUserMgmtOpen(false)} />
    </>
  );
}
