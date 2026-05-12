import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [expandedUserId, setExpandedUserId] = useState(null);

	const [newCampaign, setNewCampaign] = useState({ user_id: '', name: '' });
	const [newFolder, setNewFolder] = useState({ campaign_id: '', name: '' });
	const [newArticle, setNewArticle] = useState({ folder_id: '', title: '' });
	const [newSection, setNewSection] = useState({
		article_id: '',
		section_title: '',
		section_text: '',
	});

	const fetchUsers = useCallback(async () => {
		try {
			const res = await fetch('/api/admin/users');
			if (!res.ok) throw new Error('Failed to fetch users');
			const data = await res.json();
			setUsers(data);
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		if (!user) return;
		if (user.role !== 'admin') {
			navigate('/', { replace: true });
			return;
		}
		fetchUsers();
	}, [user, navigate, fetchUsers]);

	const handleDeleteUser = async (userId) => {
		if (!window.confirm('Permanently delete this user and all their data?')) return;
		await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
		fetchUsers();
	};

	const handleDeleteCampaign = async (campaignId) => {
		if (!window.confirm('Delete this campaign?')) return;
		await fetch(`/api/admin/campaigns/${campaignId}`, { method: 'DELETE' });
		fetchUsers();
	};

	const handleDeleteFolder = async (folderId) => {
		if (!window.confirm('Delete folder?')) return;
		await fetch(`/api/admin/folders/${folderId}`, { method: 'DELETE' });
		fetchUsers();
	};

	const handleDeleteArticle = async (articleId) => {
		if (!window.confirm('Delete article?')) return;
		await fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' });
		fetchUsers();
	};

	const handleDeleteSection = async (sectionId) => {
		if (!window.confirm('Delete section?')) return;
		await fetch(`/api/admin/sections/${sectionId}`, { method: 'DELETE' });
		fetchUsers();
	};

	const handleDeleteSheet = async (sheetId) => {
		if (!window.confirm('Delete character sheet?')) return;
		await fetch(`/api/character-sheets/${sheetId}`, { method: 'DELETE' });
		fetchUsers();
	};

	const handleCreateCampaign = async (e) => {
		e.preventDefault();
		await fetch('/api/admin/campaigns', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newCampaign),
		});
		setNewCampaign({ user_id: '', name: '' });
		fetchUsers();
	};

	const handleCreateFolder = async (e) => {
		e.preventDefault();
		await fetch('/api/admin/folders', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newFolder),
		});
		setNewFolder({ campaign_id: '', name: '' });
		fetchUsers();
	};

	const handleCreateArticle = async (e) => {
		e.preventDefault();
		await fetch('/api/admin/articles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newArticle),
		});
		setNewArticle({ folder_id: '', title: '' });
		fetchUsers();
	};

	const handleAddSection = async (e) => {
		e.preventDefault();
		await fetch('/api/admin/sections', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newSection),
		});
		setNewSection({ article_id: '', section_title: '', section_text: '' });
		fetchUsers();
	};

	if (!user || user.role !== 'admin') return null;

	return (
		<div className="admin-page">
			<h1 className="admin-page__title">Admin Panel</h1>

			<div className="admin-section">
				<h2 className="admin-section__heading">Users ({users.length})</h2>

				{users.map((u) => (
					<div key={u.id} className="admin-user-card">
						<div className="admin-user-header">
							<button
								className="admin-user-toggle"
								onClick={() =>
									setExpandedUserId(expandedUserId === u.id ? null : u.id)
								}
							>
								{expandedUserId === u.id ? '▸' : '▾'} {u.username}{' '}
								{u.role === 'admin' ? '(admin)' : ''}
							</button>
							<button
								className="admin-delete-btn"
								onClick={() => handleDeleteUser(u.id)}
							>
								Delete User
							</button>
						</div>

						{expandedUserId === u.id && (
							<div className="admin-user-detail">
								<p>ID: {u.id}</p>
								<p>
									Password Hash:{' '}
									<code>{u.password_hash}</code>
								</p>

								<h3>Campaigns</h3>
								{u.campaigns.map((c) => (
									<div key={c.id} className="admin-sub-item">
										<span>
											{c.name} (ID: {c.id})
										</span>
										<button
											onClick={() => handleDeleteCampaign(c.id)}
											className="admin-delete-btn"
										>
											Delete
										</button>
									</div>
								))}
								<form
									onSubmit={handleCreateCampaign}
									className="admin-inline-form"
								>
									<input
										type="text"
										placeholder="Campaign name"
										value={newCampaign.user_id === u.id ? newCampaign.name : ''}
										onChange={(e) =>
											setNewCampaign({
												user_id: u.id,
												name: e.target.value,
											})
										}
										required
									/>
									<button type="submit">Add Campaign</button>
								</form>

								<h3>Folders & Articles</h3>
								{u.folders.map((f) => (
									<div key={f.id} className="admin-folder">
										<div className="admin-sub-item">
											<span>
												{f.name} (ID: {f.id}) – Campaign: {f.campaign_name}
											</span>
											<button
												onClick={() => handleDeleteFolder(f.id)}
												className="admin-delete-btn"
											>
												Delete
											</button>
										</div>
										{f.articles.map((a) => (
											<div key={a.id} className="admin-sub-sub-item">
												<span>
													{a.title} (ID: {a.id})
												</span>
												<button
													onClick={() => handleDeleteArticle(a.id)}
													className="admin-delete-btn"
												>
													Delete
												</button>
												<button
													onClick={() =>
														setNewSection((prev) => ({
															...prev,
															article_id: a.id,
														}))
													}
												>
													+ Section
												</button>
											</div>
										))}
										<form
											onSubmit={handleCreateArticle}
											className="admin-inline-form"
										>
											<input
												type="text"
												placeholder="Article title"
												value={
													newArticle.folder_id === f.id
														? newArticle.title
														: ''
												}
												onChange={(e) =>
													setNewArticle({
														folder_id: f.id,
														title: e.target.value,
													})
												}
											/>

											<button type="submit">Add Article</button>
										</form>
									</div>
								))}

								<form
									onSubmit={handleCreateFolder}
									className="admin-inline-form"
								>
									<input
										type="number"
										placeholder="Campaign ID"
										value={newFolder.campaign_id}
										onChange={(e) =>
											setNewFolder((prev) => ({
												...prev,
												campaign_id: e.target.value,
											}))
										}
										required
									/>
									<input
										type="text"
										placeholder="Folder name"
										value={newFolder.name}
										onChange={(e) =>
											setNewFolder((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										required
									/>
									<button type="submit">Add Folder</button>
								</form>

								<form
									onSubmit={handleAddSection}
									className="admin-inline-form"
								>
									<input
										type="number"
										placeholder="Article ID"
										value={newSection.article_id}
										onChange={(e) =>
											setNewSection((prev) => ({
												...prev,
												article_id: e.target.value,
											}))
										}
										required
									/>
									<input
										type="text"
										placeholder="Section title"
										value={newSection.section_title}
										onChange={(e) =>
											setNewSection((prev) => ({
												...prev,
												section_title: e.target.value,
											}))
										}
										required
									/>
									<input
										type="text"
										placeholder="Section text"
										value={newSection.section_text}
										onChange={(e) =>
											setNewSection((prev) => ({
												...prev,
												section_text: e.target.value,
											}))
										}
									/>
									<button type="submit">Add Section</button>
								</form>

								<h3>Character Sheets</h3>
								{u.character_sheets.map((s) => (
									<div key={s.id} className="admin-sub-item">
										<span>
											{s.name} (ID: {s.id})
										</span>
										<button
											onClick={() => handleDeleteSheet(s.id)}
											className="admin-delete-btn"
										>
											Delete
										</button>
									</div>
								))}

								<h3>Course Progress</h3>
								{u.progress ? (
									<pre>{JSON.stringify(u.progress, null, 2)}</pre>
								) : (
									<p>No progress</p>
								)}

								<h3>Page Statuses (visits/completions)</h3>
								{u.statuses && u.statuses.length > 0 ? (
									<pre>{JSON.stringify(u.statuses, null, 2)}</pre>
								) : (
									<p>No statuses</p>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}