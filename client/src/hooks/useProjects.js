import { useState, useEffect, useCallback } from 'react';
import * as api from '../api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch {
      // ignore — auth error will be caught by context
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const add = useCallback(async (payload) => {
    try {
      const project = await api.createProject(payload);
      setProjects((prev) => [project, ...prev]);
      return project.id;
    } catch (err) {
      window.alert(err.message);
      return null;
    }
  }, []);

  const update = useCallback(async (id, patch) => {
    try {
      const project = await api.updateProject(id, patch);
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
    } catch (err) {
      window.alert(err.message);
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert(err.message);
    }
  }, []);

  const exportJson = useCallback(async () => {
    try {
      const data = await api.exportProjects();
      return JSON.stringify(data, null, 2);
    } catch (err) {
      window.alert(err.message);
      return '[]';
    }
  }, []);

  return { projects, loading, add, update, remove, exportJson, refetch: fetchProjects };
}
