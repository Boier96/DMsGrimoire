import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../context/CampaignContext';

export default function CampaignDetailPage() {
	const { campaignId } = useParams();
	const { campaigns, deleteCampaign, setActiveCampaignId, setLastCampaignId, bumpSidebarRefresh } = useCampaigns();
	const navigate = useNavigate();

	const [folders, setFolders] = useState([]);
	const [articles, setArticles] = useState({});
	const [newFolderName, setNewFolderName] = useState('');
	const [newArticleTitles, setNewArticleTitles] = useState({});

	const campaign = campaigns.find(c => c.id == campaignId);

	useEffect(() => {
		setActiveCampaignId(campaignId ? Number(campaignId) : null);
		return () => setActiveCampaignId(null);
	}, [campaignId, setActiveCampaignId]);

	useEffect(() => {
		if (campaignId) {
			setLastCampaignId(Number(campaignId));
		}
	}, [campaignId, setLastCampaignId]);

	useEffect(() => {
		if (!campaignId) return;
		fetch(`/api/folders?campaign_id=${campaignId}`)
			.then(res => res.json())
			.then(data => {
				setFolders(data);
				data.forEach(f => fetchArticles(f.id));
			});
	}, [campaignId]);

	const handleDeleteFolder = async (folderId) => {
		if (!window.confirm('Delete folder and all its articles?')) return;
		await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
		setFolders(prev => prev.filter(f => f.id !== folderId));
		bumpSidebarRefresh();
	};

	const handleDeleteArticle = async (articleId, folderId) => {
		if (!window.confirm('Delete article?')) return;
		await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
		fetchArticles(folderId);
		bumpSidebarRefresh();
	};

	const handleDeleteCampaign = async () => {
		if (!window.confirm('Delete this entire campaign and all its contents?')) return;
		await deleteCampaign(campaign.id);
		bumpSidebarRefresh();
		navigate('/campaigns');
	};

	const fetchArticles = async (folderId) => {
		const res = await fetch(`/api/articles?folder_id=${folderId}`);
		const arts = await res.json();
		setArticles(prev => ({ ...prev, [folderId]: arts }));
	};

	const handleCreateFolder = async (e) => {
		e.preventDefault();
		if (!newFolderName.trim()) return;
		await fetch(`/api/folders?campaign_id=${campaignId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newFolderName.trim() }),
		});
		setNewFolderName('');
		const res = await fetch(`/api/folders?campaign_id=${campaignId}`);
		setFolders(await res.json());
	};

	const handleCreateArticle = async (folderId) => {
		const title = newArticleTitles[folderId]?.trim();
		if (!title) return;
		await fetch(`/api/articles?folder_id=${folderId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title }),
		});
		setNewArticleTitles(prev => ({ ...prev, [folderId]: '' }));
		fetchArticles(folderId);
	};

	if (!campaign) return <div className="campaign-detail__not-found">Campaign not found.</div>;

	return (
		<div className="campaign-detail">
			<div className="campaign-detail__header">
				<h1 className="campaign-detail__title">{campaign.name}</h1>
				<button
					onClick={handleDeleteCampaign}
					className="campaign-detail__delete-campaign-btn"
				>
					Delete Campaign
				</button>
			</div>

			<form onSubmit={handleCreateFolder} className="campaign-detail__form">
				<input
					type="text"
					value={newFolderName}
					onChange={e => setNewFolderName(e.target.value)}
					placeholder="New folder name"
					className="campaign-detail__form-input"
				/>
				<button type="submit" className="campaign-detail__form-submit">
					Add Folder
				</button>
			</form>

			{folders.length === 0 && <p className="campaign-detail__empty">No folders yet.</p>}

			{folders.map(folder => (
				<div key={folder.id} className="campaign-detail__folder">
					<div className="campaign-detail__folder-header">
						<h2 className="campaign-detail__folder-name">{folder.name}</h2>
						<button onClick={() => handleDeleteFolder(folder.id)} className="campaign-detail__folder-delete">
							Delete Folder
						</button>
					</div>

					<div className="campaign-detail__article-list">
						{(articles[folder.id] || []).map(article => (
							<div key={article.id} className="campaign-detail__article-row">
								<span
									className="campaign-detail__article-title"
									onClick={() => navigate(`/articles/${article.id}`)}
								>
									{article.title}
								</span>
								<button
									onClick={() => handleDeleteArticle(article.id, folder.id)}
									className="campaign-detail__article-delete"
								>
									Delete
								</button>
							</div>
						))}

						<div className="campaign-detail__add-article-row">
							<input
								type="text"
								value={newArticleTitles[folder.id] || ''}
								onChange={e => setNewArticleTitles(prev => ({ ...prev, [folder.id]: e.target.value }))}
								placeholder="New article title"
								className="campaign-detail__add-article-input"
							/>
							<button
								onClick={() => handleCreateArticle(folder.id)}
								className="campaign-detail__add-article-btn"
							>
								Add
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}