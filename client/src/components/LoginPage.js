import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!username.trim() || !password.trim()) {
        setError('Kullanıcı adı ve şifre gerekli');
        return;
      }
      setLoading(true);
      setError('');
      try {
        await login(username.trim(), password);
      } catch (err) {
        setError(err.message || 'Giriş başarısız');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      } finally {
        setLoading(false);
      }
    },
    [username, password, login]
  );

  return (
    <div className="ft-login-page">
      <div className="ft-login-bg" aria-hidden />
      {/* Animated floating orbs */}
      <div className="ft-login-orb ft-login-orb--1" aria-hidden />
      <div className="ft-login-orb ft-login-orb--2" aria-hidden />
      <div className="ft-login-orb ft-login-orb--3" aria-hidden />
      {/* Grid pattern overlay */}
      <div className="ft-login-grid" aria-hidden />
      <motion.div
        className={`ft-login-card ${shake ? 'ft-login-card--shake' : ''}`}
        initial={{ opacity: 0, y: 50, scale: 0.92, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', damping: 22, stiffness: 200, duration: 0.8 }}
      >
        <div className="ft-login-card__header">
          <motion.span
            className="ft-login-card__logo"
            aria-hidden
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
          >
            ◆
          </motion.span>
          <motion.h1
            className="ft-login-card__title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Freelance İş Takip
          </motion.h1>
          <motion.p
            className="ft-login-card__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            Hesabınıza giriş yapın
          </motion.p>
        </div>
        <form className="ft-login-form" onSubmit={handleSubmit}>
          <motion.div
            className="ft-login-field"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <label htmlFor="login-user">Kullanıcı adı</label>
            <input
              id="login-user"
              className="ft-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </motion.div>
          <motion.div
            className="ft-login-field"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <label htmlFor="login-pass">Şifre</label>
            <input
              id="login-pass"
              className="ft-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </motion.div>
          <AnimatePresence>
            {error && (
              <motion.p
                className="ft-login-error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            className="ft-btn ft-btn--primary ft-login-submit"
            disabled={loading}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="ft-login-spinner" aria-label="Yükleniyor" />
            ) : (
              'Giriş yap'
            )}
          </motion.button>
        </form>
        <motion.p
          className="ft-login-card__footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Varsayılan: <strong>admin</strong> / <strong>admin123</strong>
        </motion.p>
      </motion.div>
    </div>
  );
}
