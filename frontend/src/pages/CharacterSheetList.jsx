import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CharacterSheetList() {
	const [sheets, setSheets] = useState([]);
	const [newName, setNewName] = useState('');
	const navigate = useNavigate();

	const fetchSheets = () => {
		fetch('/api/character-sheets')
			.then(r => r.json())
			.then(setSheets)
			.catch(console.error);
	};
	useEffect(fetchSheets, []);

	const createSheet = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		const res = await fetch('/api/character-sheets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newName.trim() }),
		});
		if (res.ok) {
			const data = await res.json();
			setNewName('');
			fetchSheets();
		}
	};

	const deleteSheet = async (id) => {
		if (!window.confirm('Delete this sheet?')) return;
		await fetch(`/api/character-sheets/${id}`, { method: 'DELETE' });
		fetchSheets();
	};

	return (
		<div className="character-sheets-page">
			<div className="character-list-header">
				<h2 className="campaigns-page__title">Character Sheets</h2>
			</div>

			<form className="campaigns-form" onSubmit={createSheet}>
				<input
					className="campaigns-form__input"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					placeholder="Sheet name"
				/>
				<button className="campaigns-form__submit" type="submit">Create</button>
			</form>

			<div className="sheet-grid">
				{sheets.map((sheet) => (
					<div key={sheet.id} className="sheet-card">
						<div className="sheet-card-link">
							<h3 onClick={() => navigate(`/character-sheets/${sheet.id}`)}>
								{sheet.name}
							</h3>
						</div>
						<div className="sheet-card-actions">
							<button
								className="campaign-card__delete"
								onClick={() => deleteSheet(sheet.id)}
							>
								Delete
							</button>
						</div>
					</div>
				))}
				{sheets.length === 0 && <p className="campaigns-empty">No character sheets yet.</p>}
			</div>
		</div>
	);
}