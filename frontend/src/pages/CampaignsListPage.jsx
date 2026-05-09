import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../context/CampaignContext';

export default function CampaignsListPage() {
	const { campaigns, createCampaign, deleteCampaign } = useCampaigns();
	const [newName, setNewName] = useState('');
	const navigate = useNavigate();

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		const camp = await createCampaign(newName.trim());
		setNewName('');
		navigate(`/campaigns/${camp.id}`);
	};

	return (
		<div className="campaigns-page">
			<h1 className="campaigns-page__title">Campaigns</h1>

			<form onSubmit={handleCreate} className="campaigns-form">
				<input
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					placeholder="New campaign name"
					className="campaigns-form__input"
				/>
				<button
					type="submit"
					className="campaigns-form__submit"
				>
					Create
				</button>
			</form>

			{campaigns.length === 0 && (
				<p className="campaigns-empty">No campaigns yet. create one above crud</p>
			)}

			<div className="campaigns-grid">
				{campaigns.map(c => (
					<div key={c.id} className="campaign-card">
						<div
							className="campaign-card__name"
							onClick={() => navigate(`/campaigns/${c.id}`)}
						>
							{c.name}
						</div>
						<button
							onClick={() => {
								if (window.confirm('Delete this campaign?')) deleteCampaign(c.id);
							}}
							className="campaign-card__delete"
						>
							Delete
						</button>
					</div>
				))}
			</div>
		</div>
	);
}