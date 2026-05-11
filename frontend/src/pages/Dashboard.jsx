import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useCampaigns } from '../context/CampaignContext';
import DashboardCard from '../components/DashboardCard';
import LastCourseCard from '../components/LastCourseCard';

function LastArticleCard({ articleId }) {
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);

    useEffect(() => {
      if (!articleId) return;
      fetch(`/api/articles/${articleId}`)
        .then(res => res.json())
        .then(data => setArticle(data))
        .catch(console.error);
    }, [articleId]);

    if (!articleId || !article) {
      return (
        <DashboardCard title="Last Article">
          <p className="text-muted">No articles visited yet, open a campaign article to see it here dawg.</p>
        </DashboardCard>
      );
    }

    const excerpt = article.primary_content
      ? article.primary_content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
      : 'No content yet.';

	return (
		<DashboardCard title="Last Article">
			<h3
				onClick={() => navigate(`/articles/${article.id}`)}
				className="last-article-title"
			>
				{article.title}
			</h3>
			<p className="excerpt-text">{excerpt}</p>
		</DashboardCard>
	);
}

export default function Dashboard() {
    const { lastVisitedItem } = useCourse();
    const { campaigns, lastArticleId, lastCampaignId } = useCampaigns();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => { 
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch stats', err));
    }, []);

    const currentCampaign = useMemo(() => {
      if (!campaigns.length) return null;
      if (lastCampaignId) {
        return campaigns.find(c => c.id === lastCampaignId) || campaigns[0];
      }
      return campaigns[0];
    }, [campaigns, lastCampaignId]);

	  return (
		  <div className="cards-grid">
        <LastCourseCard lastVisitedItem={lastVisitedItem} />

        <LastArticleCard articleId={lastArticleId} />

        <DashboardCard title="Current Campaign">
          {currentCampaign ? (
            <>
              <h3
                onClick={() => navigate(`/campaigns/${currentCampaign.id}`)}
                className="campaign-name-link"
              >
                {currentCampaign.name}
              </h3>
              <button
                onClick={() => navigate('/campaigns')}
                className="new-campaign-link"
              >
                + New
              </button>
              <p className="campaign-updated-text">
                Last updated: {new Date(currentCampaign.updated_at).toLocaleDateString()}
              </p>
            </>
          ) : (
            <div>
              <p className="text-muted">No campaigns yet.</p>
              <button
                onClick={() => navigate('/campaigns')}
                className="create-campaign-btn"
              >
                Create Campaign
              </button>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Character Sheets">
          <button
            onClick={() => navigate('/character-sheets')}
            className="new-campaign-link"
          >
            View & Create Sheets
          </button>
        </DashboardCard>

        <DashboardCard title="Your Stats">
          {stats ? (
            <>
              <p>Chapters completed: {stats.chapters_completed}</p>
              <p>Parts completed: {stats.parts_completed}</p>
              <p>Articles written: {stats.articles_count}</p>
              <p>Total words: {stats.total_words}</p>
              <p>Character sheets: {stats.character_sheets_count}</p>
            </>
          ) : (
            <p className="text-muted">Loading stats…</p>
          )}
        </DashboardCard>
      </div>
  );
}