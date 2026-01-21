import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import type { Team } from '../types';

export default function Teams() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', home_day: '', home_time: '', address: '' });

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  const createMutation = useMutation({
    mutationFn: api.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsAdding(false);
      setFormData({ name: '', home_day: '', home_time: '', address: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; home_day: string; home_time: string; address: string } }) =>
      api.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setEditingId(null);
      setFormData({ name: '', home_day: '', home_time: '', address: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setFormData({ name: team.name, home_day: team.home_day, home_time: team.home_time, address: team.address });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', home_day: '', home_time: '', address: '' });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
        {!isAdding && isAdmin && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            + Add Team
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? 'Edit Team' : 'Add New Team'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., Thunder Birds"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Home Day
                </label>
                <select
                  required
                  value={formData.home_day}
                  onChange={(e) => setFormData({ ...formData, home_day: e.target.value })}
                  className="input"
                >
                  <option value="">Select a day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Home Time
                </label>
                <input
                  type="text"
                  required
                  value={formData.home_time}
                  onChange={(e) => setFormData({ ...formData, home_time: e.target.value })}
                  className="input"
                  placeholder="e.g., 18:00 - 20:00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                placeholder="e.g., Sports Hall A, 123 Main Street, City"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => {
          const canEdit = isAdmin || user?.team_id === team.id;
          
          return (
            <div key={team.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </h3>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(team)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this team?')) {
                            deleteMutation.mutate(team.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Home Day:</span> {team.home_day}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Time:</span> {team.home_time}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Address:</span> {team.address}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {(!teams || teams.length === 0) && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No teams yet. Add your first team to get started!
        </div>
      )}
    </div>
  );
}
