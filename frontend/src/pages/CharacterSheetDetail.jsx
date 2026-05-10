import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CharacterSheetDetail() {
	const { sheetId } = useParams();
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	const [sheetName, setSheetName] = useState('');
	const [saving, setSaving] = useState(false);
	const [pdfUrl, setPdfUrl] = useState(null);
	const [viewerReady, setViewerReady] = useState(false);

	useEffect(() => {
		setViewerReady(false);
	}, [sheetId]);

	useEffect(() => {
		fetch(`/api/character-sheets/${sheetId}`)
			.then(r => r.json())
			.then(data => setSheetName(data.name || ''))
			.catch(console.error);
	}, [sheetId]);

	useEffect(() => {
		fetch(`/api/character-sheets/${sheetId}?pdf=1`)
			.then(res => res.blob())
			.then(blob => {
				const blobUrl = URL.createObjectURL(blob);
				const viewerUrl = `/pdfjs/web/viewer.html?file=${encodeURIComponent(blobUrl)}`;
				setPdfUrl(viewerUrl);
				setViewerReady(false);
				return () => URL.revokeObjectURL(blobUrl);
			})
			.catch(console.error);
	}, [sheetId]);

	const handleSave = () => {
		if (!iframeRef.current || !viewerReady) return;
		setSaving(true);
		iframeRef.current.contentWindow.saveCharacterSheet(sheetId);
	};

    useEffect(() => {
        setViewerReady(false);
    }, [pdfUrl]);

	useEffect(() => {
		const handler = (event) => {
			if (event.source !== iframeRef.current?.contentWindow) return;

			if (event.data?.type === 'VIEWER_READY') {
				setViewerReady(true);
			}
			if (event.data?.type === 'SAVE_COMPLETE') {
                setSaving(false);
                if (event.data.success) {
                    alert('Sheet saved!');
                } else {
                    alert('Save failed.');
                }
            }
		};
		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, [sheetId]);

	if (!pdfUrl) return <div className="article-editor__loading">Loading PDF…</div>;

	return (
		<div className="character-sheet-detail">
			<button
				className="article-editor__back-btn"
				onClick={() => navigate('/character-sheets')}
			>
				Back to sheets
			</button>
			<div className="character-sheet-toolbar">
				<h2 className="campaigns-page__title">{sheetName}</h2>
				<button
					className="article-editor__save-btn"
					onClick={handleSave}
					disabled={saving || !viewerReady}
				>
					{!viewerReady ? 'Loading viewer…' : saving ? 'Saving…' : 'Save to Server'}
				</button>
			</div>
			<iframe
				ref={iframeRef}
				src={pdfUrl}
				title="Character Sheet"
				className="character-sheet-iframe"
			/>
		</div>
	);
}