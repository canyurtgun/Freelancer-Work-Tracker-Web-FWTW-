import { AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';

export default function ProjectList({ projects, onEdit, onDelete }) {
  if (projects.length === 0) {
    return (
      <div className="ft-empty-state">
        <p className="ft-empty-state__title">Henüz kayıt yok</p>
        <p className="ft-empty-state__text">
          Yeni proje ekleyerek teslim tarihlerini, fiyatları ve ek işleri takip etmeye başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="ft-project-grid">
      <AnimatePresence mode="popLayout">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
