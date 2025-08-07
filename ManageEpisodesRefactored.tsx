'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import { supabase } from '@/app/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Download, Trash2, Pencil } from 'lucide-react';
import { useRef } from "react";

// Define proper TypeScript interfaces - keeping all existing fields
interface Episode {
  episodeid?: number;           // Primary key
  episoade_name: string;        // Episode name
  episoade_image: string;       // Episode image URL
  episoade_description: string;  // Description
  episoade_order: number;       // Episode number/order
  season_id: number;           // Reference to season
  status: number;              // Status (active/inactive)
  downloadable: number;        // Downloadable flag
  type: number;                // Content type
  source: string;              // Source (e.g., 'tmdb')
  url: string;                 // Video URL
  skip_available: number;      // Skip intro/credits available
  intro_start: string;         // Intro start time
  intro_end: string;           // Intro end time
  end_credits_marker: string;  // Credits start time
  drm_uuid: string;            // DRM UUID
  drm_license_uri: string;     // DRM license URI
  created_at?: string;         // Creation timestamp
  updated_at?: string;         // Last update timestamp
  
  // TMDB compatibility fields (for display/import)
  name?: string;               // TMDB episode name
  overview?: string;           // TMDB description
  still_path?: string | null;  // TMDB image path
  episode_number?: number;     // TMDB episode number
  air_date?: string | null;    // TMDB air date
}

interface FetchedEpisode {
  episoade_name: string;
  episoade_image: string;
  episoade_description: string;
  episoade_order: number;
  season_id: number;
  status: number;
  downloadable: number;
  type: number;
  source: string;
  url: string;
  skip_available: number;
  intro_start: string;
  intro_end: string;
  end_credits_marker: string;
  drm_uuid: string;
  drm_license_uri: string;
  // TMDB compatibility fields
  name?: string;
  overview?: string;
  still_path?: string | null;
  episode_number?: number;
  air_date?: string | null;
}

interface SeasonInfo {
  tmdb_id?: string;
  season_number?: number;
  session_name?: string;
  series_name?: string;
  web_series_id?: string;
}

export default function ManageEpisodes() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.id as string;
  const seasonId = params.seasonId as string;

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedEpisodes, setFetchedEpisodes] = useState<FetchedEpisode[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Edit handlers
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [episodeToEdit, setEpisodeToEdit] = useState<Episode | null>(null);
  const [editForm, setEditForm] = useState<Partial<Episode>>({});
  const [editLoading, setEditLoading] = useState(false);
  const editFormRef = useRef<HTMLFormElement>(null);
  
  // Delete handlers
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch episodes for the season
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        
        // Validate seasonId
        if (!seasonId || isNaN(Number(seasonId))) {
          console.error('Invalid season ID:', seasonId);
          alert('Invalid season ID');
          return;
        }
        
        console.log('Fetching season data for ID:', seasonId);
        
        // First, get the season data
        const { data: seasonData, error: seasonError } = await supabase
          .from('web_series_seasons')
          .select('*')
          .eq('season_id', seasonId)
          .single();
          
        if (seasonError) {
          console.error('Error fetching season:', seasonError);
          alert(`Error loading season: ${seasonError.message}`);
          return;
        }
        
        // Then get the series data separately
        const { data: seriesData } = await supabase
          .from('web_series')
          .select('tmdb_id, name')
          .eq('web_series_id', seasonData.web_series_id)
          .single();
        
        // Combine the data
        const combinedData = {
          ...seasonData,
          web_series: seriesData
        };
        
        console.log('Combined season and series data:', combinedData);
          
        if (combinedData) {
          const seasonInfo = {
            tmdb_id: combinedData.web_series?.tmdb_id,
            season_number: combinedData.season_order,
            session_name: combinedData.session_name,
            series_name: combinedData.web_series?.name,
            web_series_id: combinedData.web_series_id
          };
          
          console.log('Season info:', seasonInfo);
          setSeasonInfo(seasonInfo);
          
          // Fetch episodes for this season
          const { data: episodesData, error: episodesError } = await supabase
            .from('web_series_episoade')
            .select('*')
            .eq('season_id', seasonId)
            .order('episoade_order', { ascending: true });
            
          if (episodesError) {
            console.error('Error fetching episodes:', episodesError);
            alert(`Error loading episodes: ${episodesError.message}`);
            return;
          }

          setEpisodes(episodesData || []);
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [seasonId]);

  // Fetch episodes from TMDB
  async function fetchFromTMDB() {
    if (!seasonInfo?.tmdb_id) {
      console.error('No TMDB ID found in season info:', seasonInfo);
      alert('Cannot fetch episodes: TMDB ID is missing for this series');
      return;
    }
    
    if (!seasonInfo?.season_number) {
      console.error('No season number found in season info:', seasonInfo);
      alert('Cannot fetch episodes: Season number is missing');
      return;
    }

    try {
      setIsFetching(true);
      
      const response = await fetch(
        `/api/tmdb/tv/${seasonInfo.tmdb_id}/season/${seasonInfo.season_number}`
      );

      if (!response.ok) {
        let errorMessage = 'Failed to fetch from TMDB';
        try {
          const errorData = await response.json();
          console.error('TMDB API Error:', errorData);
          
          if (response.status === 404) {
            errorMessage = 'Season not found on TMDB. Please check if the season number is correct.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Authentication failed with TMDB. Please check your API key.';
          } else if (errorData.details) {
            errorMessage = `${errorData.error}: ${errorData.details}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.episodes || !Array.isArray(data.episodes)) {
        console.error('Invalid episodes data received:', data);
        throw new Error('Invalid data format received from TMDB');
      }

      if (data.episodes.length === 0) {
        console.warn('No episodes found for this season on TMDB');
        alert('No episodes found for this season on TMDB. The season may not be released yet.');
        return;
      }

      // Map TMDB fields to our database schema
      const mappedEpisodes = data.episodes.map((episode: any) => ({
        season_id: Number(seasonId),
        episoade_name: episode.name || `Episode ${episode.episode_number || 1}`,
        episoade_image: episode.still_path 
          ? `https://image.tmdb.org/t/p/original${episode.still_path}` 
          : '',
        episoade_description: episode.overview || '',
        episoade_order: episode.episode_number || 1,
        status: 1,
        downloadable: 1,
        type: 1,
        source: 'tmdb',
        url: '',
        skip_available: 0,
        intro_start: '',
        intro_end: '',
        end_credits_marker: '',
        drm_uuid: '',
        drm_license_uri: '',
        // Keep TMDB fields for reference
        name: episode.name,
        overview: episode.overview,
        still_path: episode.still_path,
        episode_number: episode.episode_number,
        air_date: episode.air_date || null
      }));
      
      setFetchedEpisodes(mappedEpisodes);
      setShowReviewModal(true);
    } catch (error: any) {
      console.error('Error fetching from TMDB:', error);
      alert(`Failed to fetch episodes: ${error.message || 'Unknown error'}`);
    } finally {
      setIsFetching(false);
    }
  }

  // Create episodes from fetched data
  async function createEpisodes() {
    try {
      if (!seasonId) {
        throw new Error('Season ID is missing');
      }

      const episodesWithDefaults = fetchedEpisodes.map(episode => ({
        ...episode,
        season_id: Number(seasonId),
        episoade_name: episode.episoade_name || `Episode ${episode.episoade_order || 1}`,
        episoade_description: episode.episoade_description || '',
        episoade_order: episode.episoade_order || 1,
        episoade_image: episode.episoade_image || '',
        status: episode.status || 1,
        downloadable: episode.downloadable || 1,
        type: episode.type || 1,
        source: episode.source || 'tmdb',
        url: episode.url || '',
        skip_available: episode.skip_available || 0,
        intro_start: episode.intro_start || '',
        intro_end: episode.intro_end || '',
        end_credits_marker: episode.end_credits_marker || '',
        drm_uuid: episode.drm_uuid || '',
        drm_license_uri: episode.drm_license_uri || ''
      }));

      const { error } = await supabase
        .from('web_series_episoade')
        .insert(episodesWithDefaults);

      if (error) throw error;

      setShowReviewModal(false);
      
      // Refresh the episodes list
      const { data: updatedEpisodes, error: fetchError } = await supabase
        .from('web_series_episoade')
        .select('*')
        .eq('season_id', seasonId)
        .order('episoade_order', { ascending: true });

      if (fetchError) throw fetchError;

      setEpisodes(updatedEpisodes || []);
      alert('Episodes saved successfully!');
    } catch (error: any) {
      console.error('Error saving episodes:', error);
      alert(`Failed to save episodes: ${error.message || 'Unknown error'}`);
    }
  }

  // Handle episode editing in the review modal
  function handleEpisodeEdit(idx: number, field: keyof FetchedEpisode, value: string | boolean | number) {
    setFetchedEpisodes(episodes => {
      const copy = [...episodes];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  // Edit handlers
  function openEditModal(ep: Episode) {
    setEpisodeToEdit(ep);
    setEditForm(ep);
    setEditModalOpen(true);
  }
  
  function closeEditModal() {
    setEditModalOpen(false);
    setEpisodeToEdit(null);
    setEditForm({});
  }
  
  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!episodeToEdit?.episodeid) return;
    setEditLoading(true);
    
    const { error } = await supabase
      .from("web_series_episoade")
      .update(editForm)
      .eq("episodeid", episodeToEdit.episodeid);
    setEditLoading(false);
    
    if (error) { 
      alert(error.message); 
      return; 
    }
    
    closeEditModal();
    
    // Refresh episodes
    const { data } = await supabase
      .from("web_series_episoade")
      .select("*")
      .eq("season_id", seasonId)
      .order("episoade_order");
    setEpisodes(data || []);
  }
  
  function handleEditChange(field: keyof Episode, value: string | boolean | number) {
    setEditForm(f => ({ ...f, [field]: value }));
  }

  // Delete handlers
  function openDeleteModal(ep: Episode) {
    setEpisodeToDelete(ep);
    setDeleteModalOpen(true);
  }
  
  function closeDeleteModal() {
    setEpisodeToDelete(null);
    setDeleteModalOpen(false);
  }
  
  async function confirmDelete() {
    if (!episodeToDelete?.episodeid) return;
    setDeletingId(episodeToDelete.episodeid);
    
    const { error } = await supabase
      .from("web_series_episoade")
      .delete()
      .eq("episodeid", episodeToDelete.episodeid);
    setDeletingId(null);
    
    if (error) { 
      alert(error.message); 
      return; 
    }
    
    setEpisodes(eps => eps.filter(ep => ep.episodeid !== episodeToDelete.episodeid));
    closeDeleteModal();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading episodes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {seasonInfo?.session_name || 'Season'} Episodes
          </h1>
          <p className="text-slate-400">
            {seasonInfo?.series_name || 'Series'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={fetchFromTMDB}
            disabled={isFetching || !seasonInfo?.tmdb_id}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            title={!seasonInfo?.tmdb_id ? "TMDB ID is missing for this series" : ""}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Fetch Episodes
          </Button>
        </div>
      </div>

      {/* Review Fetched Episodes Modal - Responsive design */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="w-[98vw] sm:w-[95vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] max-w-none h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">Review Fetched Episodes</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto px-6 py-4">
            <form
              onSubmit={e => {
                e.preventDefault();
                createEpisodes();
              }}
              className="h-full flex flex-col"
            >
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto flex-1">
                <table className="min-w-full w-full">
                  <thead className="sticky top-0 bg-white border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold min-w-[200px]">Thumbnail</th>
                      <th className="text-left p-3 font-semibold min-w-[200px]">Episode Name</th>
                      <th className="text-left p-3 font-semibold min-w-[300px]">Description</th>
                      <th className="text-left p-3 font-semibold min-w-[120px]">Air Date</th>
                      <th className="text-left p-3 font-semibold min-w-[180px]">Video URL</th>
                      <th className="text-left p-3 font-semibold min-w-[100px]">Status</th>
                      <th className="text-left p-3 font-semibold min-w-[100px]">Downloadable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetchedEpisodes.map((ep, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          {ep.episoade_image ? (
                            <Image 
                              src={ep.episoade_image} 
                              alt={`${ep.episoade_name} thumbnail`}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <Input 
                            value={ep.episoade_name} 
                            onChange={e => handleEpisodeEdit(idx, 'episoade_name', e.target.value)}
                            className="min-w-[180px]"
                          />
                        </td>
                        <td className="p-3">
                          <Textarea 
                            value={ep.episoade_description} 
                            onChange={e => handleEpisodeEdit(idx, 'episoade_description', e.target.value)}
                            className="min-w-[280px] min-h-[80px] resize-y"
                            rows={3}
                          />
                        </td>
                        <td className="p-3">
                          <Input 
                            type="date"
                            value={ep.air_date || ''} 
                            onChange={e => handleEpisodeEdit(idx, 'air_date', e.target.value)}
                            className="min-w-[120px]"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            value={ep.url || ''}
                            onChange={e => handleEpisodeEdit(idx, 'url', e.target.value)}
                            className="min-w-[160px]"
                            placeholder="Video URL"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={ep.status === 1} 
                            onChange={e => handleEpisodeEdit(idx, 'status', e.target.checked ? 1 : 0)} 
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={ep.downloadable === 1} 
                            onChange={e => handleEpisodeEdit(idx, 'downloadable', e.target.checked ? 1 : 0)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4 flex-1 overflow-auto">
                {fetchedEpisodes.map((ep, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Episode Name</label>
                          <Input 
                            value={ep.episoade_name} 
                            onChange={e => handleEpisodeEdit(idx, 'episoade_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Air Date</label>
                          <Input 
                            type="date"
                            value={ep.air_date || ''} 
                            onChange={e => handleEpisodeEdit(idx, 'air_date', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {ep.episoade_image ? (
                          <Image 
                            src={ep.episoade_image} 
                            alt={`${ep.episoade_name} thumbnail`}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        value={ep.episoade_description} 
                        onChange={e => handleEpisodeEdit(idx, 'episoade_description', e.target.value)}
                        className="min-h-[80px] resize-y"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Video URL</label>
                      <Input
                        value={ep.url || ''}
                        onChange={e => handleEpisodeEdit(idx, 'url', e.target.value)}
                        placeholder="Video URL"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <label className="flex items-center gap-1 text-sm">
                        <input 
                          type="checkbox" 
                          checked={ep.status === 1} 
                          onChange={e => handleEpisodeEdit(idx, 'status', e.target.checked ? 1 : 0)} 
                        /> Published
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input 
                          type="checkbox" 
                          checked={ep.downloadable === 1} 
                          onChange={e => handleEpisodeEdit(idx, 'downloadable', e.target.checked ? 1 : 0)} 
                        /> Downloadable
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                >
                  Create Episodes ({fetchedEpisodes.length})
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Episodes Table - Responsive */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-300 font-medium">Thumbnail</th>
                <th className="text-left p-4 text-slate-300 font-medium">Episode No</th>
                <th className="text-left p-4 text-slate-300 font-medium">Name</th>
                <th className="text-left p-4 text-slate-300 font-medium">Description</th>
                <th className="text-left p-4 text-slate-300 font-medium">Air Date</th>
                <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                <th className="text-right p-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {episodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No episodes available. Try fetching episodes from TMDB.
                  </td>
                </tr>
              ) : (
                episodes.map((ep) => (
                  <tr key={ep.episodeid} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      {ep.episoade_image ? (
                        <Image 
                          src={ep.episoade_image} 
                          alt={`${ep.episoade_name} thumbnail`}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-700 rounded border flex items-center justify-center text-xs text-slate-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 font-mono">
                      {String(ep.episoade_order).padStart(2, '0')}
                    </td>
                    <td className="p-4 font-medium text-white max-w-xs">
                      <div className="truncate">{ep.episoade_name}</div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm max-w-xs">
                      <div className="truncate" title={ep.episoade_description}>
                        {ep.episoade_description || 'No description available'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {ep.air_date ? new Date(ep.air_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'TBA'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center ${
                        ep.status === 1 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-slate-600/20 text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          ep.status === 1 ? 'bg-green-400' : 'bg-slate-400'
                        }`}></span>
                        {ep.status === 1 ? 'Published' : 'Draft'}
                      </span>
                      {ep.downloadable === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 ml-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Downloadable
                        </span>
                      ) : null}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => openEditModal(ep)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => openDeleteModal(ep)}
                          disabled={deletingId === ep.episodeid}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deletingId === ep.episodeid ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-700">
          {episodes.map((ep) => (
            <div key={ep.episodeid} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-300">#{String(ep.episoade_order).padStart(2, '0')}</span>
                    {ep.episoade_image ? (
                      <Image 
                        src={ep.episoade_image} 
                        alt={`${ep.episoade_name} thumbnail`}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-700 rounded border flex items-center justify-center text-xs text-slate-500">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white mt-1">{ep.episoade_name}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {ep.episoade_description || 'No description available'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Air Date: {ep.air_date ? new Date(ep.air_date).toLocaleDateString() : 'TBA'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ep.status === 1 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-slate-600/20 text-slate-400'
                    }`}>
                      {ep.status === 1 ? 'Published' : 'Draft'}
                    </span>
                    {ep.downloadable === 1 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400">
                        Downloadable
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => openEditModal(ep)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => openDeleteModal(ep)}
                  disabled={deletingId === ep.episodeid}
                >
                  {deletingId === ep.episodeid ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center mt-8 p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-slate-400">Loading episodes...</span>
        </div>
      )}

      {!loading && episodes.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No episodes found. Try fetching episodes from TMDB.
        </div>
      )}

      {/* Edit Episode Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Episode</DialogTitle>
          </DialogHeader>
          {episodeToEdit && (
            <form ref={editFormRef} onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Episode Name</label>
                  <Input
                    value={editForm.episoade_name || ""}
                    onChange={e => handleEditChange("episoade_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Episode Order</label>
                  <Input
                    type="number"
                    value={editForm.episoade_order || ""}
                    onChange={e => handleEditChange("episoade_order", parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editForm.episoade_description || ""}
                  onChange={e => handleEditChange("episoade_description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <Input
                    value={editForm.episoade_image || ""}
                    onChange={e => handleEditChange("episoade_image", e.target.value)}
                    placeholder="Episode image URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Video URL</label>
                  <Input
                    value={editForm.url || ""}
                    onChange={e => handleEditChange("url", e.target.value)}
                    placeholder="Video URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Air Date</label>
                <Input
                  type="date"
                  value={editForm.air_date || ""}
                  onChange={e => handleEditChange("air_date", e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={editForm.status === 1} 
                    onChange={e => handleEditChange("status", e.target.checked ? 1 : 0)} 
                  /> 
                  Published
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={editForm.downloadable === 1} 
                    onChange={e => handleEditChange("downloadable", e.target.checked ? 1 : 0)} 
                  /> 
                  Downloadable
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-blue-600 text-white" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={closeEditModal}>Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Episode Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Episode</DialogTitle>
          </DialogHeader>
          {episodeToDelete && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Are you sure you want to delete <span className="font-semibold text-white">{episodeToDelete.episoade_name}</span>?
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={confirmDelete} 
                  className="bg-red-600 text-white" 
                  disabled={deletingId === episodeToDelete.episodeid}
                >
                  {deletingId === episodeToDelete.episodeid ? "Deleting..." : "Delete"}
                </Button>
                <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}