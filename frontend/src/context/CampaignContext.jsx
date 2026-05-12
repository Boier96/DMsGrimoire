import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const [lastArticleId, setLastArticleIdState] = useState(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [lastCampaignId, setLastCampaignIdState] = useState(null);

  const bumpSidebarRefresh = useCallback(() => {
    setSidebarRefresh(prev => prev + 1);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Fetch campaigns failed', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

useEffect(() => {
  if (!user) return;
  fetch('/api/last-campaign')
    .then(res => res.json())
    .then(data => {
      if (data.last_campaign_id) setLastCampaignIdState(data.last_campaign_id);
    })
    .catch(console.error);
}, [user]);

  const setLastArticleId = useCallback(async (id) => {
    setLastArticleIdState(id);
    try {
      await fetch('/api/last-article', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: id }),
      });
    } catch (err) {
      console.error('Failed to persist last article', err);
    }
  }, []);

  const setLastCampaignId = useCallback(async (id) => {
  setLastCampaignIdState(id);
  try {
    await fetch('/api/last-campaign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: id }),
    });
  } catch (err) {
    console.error('Failed to persist last campaign', err);
  }
}, []);

  const createCampaign = useCallback(async (name) => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    const newCampaign = await res.json();
    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  }, []);

  const updateCampaign = useCallback(async (id, name) => {
    await fetch(`/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, []);

  const deleteCampaign = useCallback(async (id) => {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <CampaignContext.Provider value={{
  campaigns,
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  activeCampaignId,
  setActiveCampaignId,
  lastArticleId,
  setLastArticleId,
  sidebarRefresh,
  bumpSidebarRefresh,
  lastCampaignId,
  setLastCampaignId,
    }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignProvider');
  return ctx;
}