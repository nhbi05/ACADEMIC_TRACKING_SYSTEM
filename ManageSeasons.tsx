'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef } from "react";
import { Plus, Search, Loader2, Pencil, Trash2, Tv, ListVideo, Download, X } from 'lucide-react';

// Define types for better type safety
interface Season {
  id: string;
  series_id: string;
  name: string;
  order: number;
  status: number;
  episode_count?: number;
  created_at?: string;
  updated_at?: string;
  // Additional fields for compatibility
  season_id?: number;
  web_series_id?: number;
  session_name?: string;
  season_order?: number;
}

interface FetchedSeason {
  name: string;
  order: number;
  status: number;
  episode_count?: number;
  session_name?: string;
  season_order?: number;
}

export default function ManageSeasons() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.id as string;
  
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seriesName, setSeriesName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSeason, setNewSeason] = useState({
    session_name: "",
    season_order: "",
    status: 1,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [tmdbId, setTmdbId] = useState<number | null>(null);

  // For fetch/review modal
  const [fetchedSeasons, setFetchedSeasons] = useState<FetchedSeason[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Edit handlers
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [seasonToEdit, setSeasonToEdit] = useState<Season | null>(null);
  const [editForm, setEditForm] = useState<Partial<Season>>({});
  const [editLoading, setEditLoading] = useState(false);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<Season | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeasons() {
      setLoading(true);
      
      try {
        // Fetch series data including TMDB ID
        const { data: seriesData } = await supabase
          .from('web_series')
          .select('name, tmdb_id')
          .eq('web_series_id', seriesId)
          .single();
          
        if (seriesData?.tmdb_id) {
          setTmdbId(seriesData.tmdb_id);
        }
        
        if (seriesData) {
          setSeriesName(seriesData.name);
        }
        
        // Fetch seasons for this series
        const { data: seasonsData, error: seasonsError } = await supabase
          .from('web_series_seasons')
          .select('*')
          .eq('web_series_id', seriesId)
          .order('season_order', { ascending: true });
          
        if (seasonsError) throw seasonsError;
        
        // Get episode counts for each season
        const seasonsWithEpisodes = await Promise.all(
          (seasonsData || []).map(async (season) => {
            const { count, error: countError } = await supabase
              .from('web_series_episoade')
              .select('*', { count: 'exact', head: true })
              .eq('season_id', season.season_id);
              
            if (countError) {
              console.error('Error counting episodes:', countError);
              return { 
                ...season, 
                episode_count: 0,
                id: season.season_id?.toString() || season.id?.toString() || '',
                series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
                name: season.session_name || season.name || '',
                order: season.season_order || season.order || 0
              };
            }
            
            return { 
              ...season, 
              episode_count: count || 0,
              id: season.season_id?.toString() || season.id?.toString() || '',
              series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
              name: season.session_name || season.name || '',
              order: season.season_order || season.order || 0
            };
          })
        );
        
        setSeasons(seasonsWithEpisodes);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSeasons();
  }, [seriesId]);

  async function fetchFromTMDB() {
    if (!tmdbId) {
      alert('No TMDB ID found for this series');
      return;
    }

    try {
      setIsFetching(true);
      
      // Fetch series details from our API endpoint
      const response = await fetch(`/api/tmdb/tv/${tmdbId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData.error || responseText || 'Failed to fetch from TMDB'}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid JSON response from API');
      }
      
      if (!data.success || !data.seasons) {
        throw new Error('No seasons data found in TMDB response');
      }
      
      if (data.seasons && data.seasons.length > 0) {
        const fetchedSeasonsData = data.seasons.map((season: any) => ({
          session_name: season.session_name || season.name || `Season ${season.season_order || season.order}`,
          season_order: season.season_order || season.order,
          status: season.status || 1,
          episode_count: season.episode_count || 0,
          name: season.session_name || season.name || `Season ${season.season_order || season.order}`,
          order: season.season_order || season.order
        }));
        
        setFetchedSeasons(fetchedSeasonsData);
        setShowReviewModal(true);
      } else {
        alert('No seasons found on TMDB');
      }
    } catch (error) {
      console.error('Detailed error fetching from TMDB:', error);
      
      let errorMessage = 'Failed to fetch seasons from TMDB.';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Bad request - The TMDB ID might be invalid or the API key is incorrect.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication failed - Please check the TMDB API key configuration.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Series not found on TMDB with the provided ID.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests to TMDB API - Please try again in a few minutes.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error - Please check the API endpoint configuration.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsFetching(false);
    }
  }

  async function createSeasons() {
    const payload = fetchedSeasons.map(s => ({
      web_series_id: parseInt(seriesId),
      session_name: s.session_name || s.name,
      season_order: Number(s.season_order || s.order),
      status: s.status || 1,
    }));
    
    // Check if seasons already exist to avoid duplicates
    const { data: existingSeasons, error: checkError } = await supabase
      .from('web_series_seasons')
      .select('season_order')
      .eq('web_series_id', seriesId);
    
    if (checkError) {
      console.error('Error checking existing seasons:', checkError);
      alert(checkError.message);
      return;
    }
    
    const existingOrders = existingSeasons?.map(s => s.season_order) || [];
    const newSeasons = payload.filter((s: any) => !existingOrders.includes(s.season_order));
    
    if (newSeasons.length === 0) {
      alert('All seasons from TMDB already exist in the database');
      setShowReviewModal(false);
      return;
    }
    
    const { error } = await supabase.from("web_series_seasons").insert(newSeasons);
    if (error) {
      alert(error.message);
      return;
    }
    setShowReviewModal(false);
    // Refresh seasons list
    const { data: seasonsData } = await supabase
      .from('web_series_seasons')
      .select('*')
      .eq('web_series_id', seriesId)
      .order('season_order', { ascending: true });
      
    // Get episode counts for each season
    const seasonsWithEpisodes = await Promise.all(
      (seasonsData || []).map(async (season) => {
        const { count, error: countError } = await supabase
          .from('web_series_episoade')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', season.season_id);
          
        if (countError) {
          console.error('Error counting episodes:', countError);
          return { 
            ...season, 
            episode_count: 0,
            id: season.season_id?.toString() || season.id?.toString() || '',
            series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
            name: season.session_name || season.name || '',
            order: season.season_order || season.order || 0
          };
        }
        
        return { 
          ...season, 
          episode_count: count || 0,
          id: season.season_id?.toString() || season.id?.toString() || '',
          series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
          name: season.session_name || season.name || '',
          order: season.season_order || season.order || 0
        };
      })
    );
    
    setSeasons(seasonsWithEpisodes);
    alert(`Successfully fetched and saved ${newSeasons.length} new seasons from TMDB!`);
  }

  // Edit handlers
  function openEditModal(season: Season) {
    setSeasonToEdit(season);
    setEditForm({
      ...season,
      session_name: season.session_name || season.name,
      season_order: season.season_order || season.order
    });
    setEditModalOpen(true);
  }
  function closeEditModal() {
    setEditModalOpen(false);
    setSeasonToEdit(null);
    setEditForm({});
  }
  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonToEdit?.season_id && !seasonToEdit?.id) return;
    setEditLoading(true);
    
    const updateData = {
      session_name: editForm.session_name || editForm.name,
      season_order: editForm.season_order || editForm.order,
      status: editForm.status
    };
    
    const { error } = await supabase
      .from("web_series_seasons")
      .update(updateData)
      .eq('season_id', seasonToEdit.season_id || seasonToEdit.id);
    setEditLoading(false);
    if (error) { alert(error.message); return; }
    closeEditModal();
    // Refresh seasons
    const { data: seasonsData } = await supabase
      .from('web_series_seasons')
      .select('*')
      .eq('web_series_id', seriesId)
      .order('season_order', { ascending: true });
      
    // Get episode counts for each season
    const seasonsWithEpisodes = await Promise.all(
      (seasonsData || []).map(async (season) => {
        const { count, error: countError } = await supabase
          .from('web_series_episoade')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', season.season_id);
          
        if (countError) {
          console.error('Error counting episodes:', countError);
          return { 
            ...season, 
            episode_count: 0,
            id: season.season_id?.toString() || season.id?.toString() || '',
            series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
            name: season.session_name || season.name || '',
            order: season.season_order || season.order || 0
          };
        }
        
        return { 
          ...season, 
          episode_count: count || 0,
          id: season.season_id?.toString() || season.id?.toString() || '',
          series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
          name: season.session_name || season.name || '',
          order: season.season_order || season.order || 0
        };
      })
    );
    
    setSeasons(seasonsWithEpisodes);
  }
  function handleEditChange(field: keyof Season, value: string | boolean | number) {
    setEditForm(f => ({ ...f, [field]: value }));
  }
  
  // Delete handlers
  function openDeleteModal(season: Season) {
    setSeasonToDelete(season);
    setDeleteModalOpen(true);
  }
  function closeDeleteModal() {
    setSeasonToDelete(null);
    setDeleteModalOpen(false);
  }
  async function confirmDelete() {
    if (!seasonToDelete?.season_id && !seasonToDelete?.id) return;
    setDeletingId(seasonToDelete.id);
    
    // First, delete all episodes in this season
    const { error: episodesError } = await supabase
      .from('web_series_episoade')
      .delete()
      .eq('season_id', seasonToDelete.season_id || seasonToDelete.id);
    
    if (episodesError) {
      console.error('Error deleting episodes:', episodesError);
      alert('Failed to delete episodes. Please try again.');
      setDeletingId(null);
      return;
    }
    
    // Then delete the season
    const { error } = await supabase
      .from("web_series_seasons")
      .delete()
      .eq('season_id', seasonToDelete.season_id || seasonToDelete.id);
    setDeletingId(null);
    if (error) { alert(error.message); return; }
    setSeasons(seasons => seasons.filter(s => s.id !== seasonToDelete.id));
    closeDeleteModal();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading seasons...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Seasons</h1>
          <p className="text-slate-400">
            {seriesName ? `Series: ${seriesName}` : 'Loading series...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Season
          </Button>
          
          {tmdbId && (
            <Button 
              onClick={fetchFromTMDB}
              disabled={isFetching}
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Fetch All Seasons
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Add Season Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Season</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAddLoading(true);
              await supabase.from("web_series_seasons").insert({
                web_series_id: parseInt(seriesId),
                session_name: newSeason.session_name,
                season_order: parseInt(newSeason.season_order, 10),
                status: newSeason.status,
              });
              setAddLoading(false);
              setShowAddModal(false);
              setNewSeason({ session_name: "", season_order: "", status: 1 });
              // Refresh seasons
              const { data: seasonsData } = await supabase
                .from('web_series_seasons')
                .select('*')
                .eq('web_series_id', seriesId)
                .order('season_order', { ascending: true });
                
              // Get episode counts for each season
              const seasonsWithEpisodes = await Promise.all(
                (seasonsData || []).map(async (season) => {
                  const { count, error: countError } = await supabase
                    .from('web_series_episoade')
                    .select('*', { count: 'exact', head: true })
                    .eq('season_id', season.season_id);
                    
                  if (countError) {
                    console.error('Error counting episodes:', countError);
                    return { 
                      ...season, 
                      episode_count: 0,
                      id: season.season_id?.toString() || season.id?.toString() || '',
                      series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
                      name: season.session_name || season.name || '',
                      order: season.season_order || season.order || 0
                    };
                  }
                  
                  return { 
                    ...season, 
                    episode_count: count || 0,
                    id: season.season_id?.toString() || season.id?.toString() || '',
                    series_id: season.web_series_id?.toString() || season.series_id?.toString() || '',
                    name: season.session_name || season.name || '',
                    order: season.season_order || season.order || 0
                  };
                })
              );
              
              setSeasons(seasonsWithEpisodes);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1 text-white">Season Name</label>
              <input
                className="w-full border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white"
                value={newSeason.session_name}
                onChange={e => setNewSeason(s => ({ ...s, session_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-white">Order</label>
              <input
                type="number"
                className="w-full border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white"
                value={newSeason.season_order}
                onChange={e => setNewSeason(s => ({ ...s, season_order: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={newSeason.status === 1}
                  onChange={e => setNewSeason(s => ({ ...s, status: e.target.checked ? 1 : 0 }))}
                />
                Published
              </label>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={addLoading}>
              {addLoading ? "Adding..." : "Add Season"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Fetched Seasons Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fetch Seasons</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              createSeasons();
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full mb-4 bg-slate-800 rounded-lg">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="px-4 py-2 text-left text-slate-300">Order</th>
                    <th className="px-4 py-2 text-left text-slate-300">Season Name</th>
                    <th className="px-4 py-2 text-left text-slate-300">Episodes</th>
                    <th className="px-4 py-2 text-left text-slate-300">Publish</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedSeasons.map((season, idx) => (
                    <tr key={idx} className="border-b border-slate-700">
                      <td className="px-4 py-2 text-white">{season.season_order || season.order}</td>
                      <td className="px-4 py-2">
                        <input
                          value={season.session_name || season.name}
                          onChange={e => {
                            const updated = [...fetchedSeasons];
                            updated[idx].session_name = e.target.value;
                            updated[idx].name = e.target.value;
                            setFetchedSeasons(updated);
                          }}
                          className="border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={season.episode_count || ''}
                          onChange={e => {
                            const updated = [...fetchedSeasons];
                            updated[idx].episode_count = e.target.value ? Number(e.target.value) : undefined;
                            setFetchedSeasons(updated);
                          }}
                          className="border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={season.status === 1}
                          onChange={e => {
                            const updated = [...fetchedSeasons];
                            updated[idx].status = e.target.checked ? 1 : 0;
                            setFetchedSeasons(updated);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Season Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Season</DialogTitle>
          </DialogHeader>
          {seasonToEdit && (
            <form ref={editFormRef} onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block mb-1 text-white">Season Name</label>
                <input
                  className="w-full border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white"
                  value={editForm.session_name || editForm.name || ""}
                  onChange={e => {
                    handleEditChange("session_name", e.target.value);
                    handleEditChange("name", e.target.value);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-white">Order</label>
                <input
                  type="number"
                  className="w-full border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white"
                  value={editForm.season_order || editForm.order || ""}
                  onChange={e => {
                    handleEditChange("season_order", parseInt(e.target.value));
                    handleEditChange("order", parseInt(e.target.value));
                  }}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editForm.status === 1}
                    onChange={e => handleEditChange("status", e.target.checked ? 1 : 0)}
                  />
                  Published
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 text-white" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
                <Button type="button" variant="outline" onClick={closeEditModal}>Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Season Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Season</DialogTitle>
          </DialogHeader>
          {seasonToDelete && (
            <div className="space-y-4">
              <p className="text-white">Are you sure you want to delete <span className="font-semibold">{seasonToDelete.session_name || seasonToDelete.name}</span>?</p>
              <div className="flex gap-2">
                <Button onClick={confirmDelete} className="bg-red-600 text-white" disabled={deletingId === seasonToDelete.id}>{deletingId === seasonToDelete.id ? "Deleting..." : "Delete"}</Button>
                <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Seasons Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-300 font-medium">#</th>
                <th className="text-left p-4 text-slate-300 font-medium">Season Name</th>
                <th className="text-left p-4 text-slate-300 font-medium">Order</th>
                <th className="text-left p-4 text-slate-300 font-medium">Episodes</th>
                <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                <th className="text-right p-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {seasons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No seasons available
                  </td>
                </tr>
              ) : (
                seasons.map((season, idx) => (
                  <tr key={season.season_id || season.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4 text-slate-300">{idx + 1}</td>
                    <td className="p-4 font-medium text-white">{season.session_name || season.name}</td>
                    <td className="p-4 text-white">{season.season_order || season.order}</td>
                    <td className="p-4 text-white">{season.episode_count ?? ''}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        season.status === 1 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-slate-600/20 text-slate-400'
                      }`}>
                        {season.status === 1 ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => router.push(`/tv-series/${seriesId}/seasons/${season.season_id || season.id}/episodes`)}
                        >
                          <ListVideo className="h-3 w-3 mr-1" />
                          Episodes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => openEditModal(season)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => openDeleteModal(season)}
                          disabled={deletingId === season.id}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deletingId === season.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <div className="mt-4 text-slate-400">Loading...</div>}
    </div>
  );
}