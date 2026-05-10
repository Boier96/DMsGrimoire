import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ChapterPage from './pages/ChapterPage';
import PartPage from './pages/PartPage';
import { CampaignProvider } from './context/CampaignContext';
import CampaignsListPage from './pages/CampaignsListPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import CharacterSheetList from './pages/CharacterSheetList';
import CharacterSheetDetail from './pages/CharacterSheetDetail';

function HomeRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">lödder...</div>;
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <CampaignProvider> 
            <Routes>
              <Route path="/" element={<HomeRouter />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/course/:chapterSlug" element={<ChapterPage />} />
                <Route path="/course/:chapterSlug/:partSlug" element={<PartPage />} />

                <Route path="/campaigns" element={<CampaignsListPage />} />
                <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
                <Route path="/articles/:articleId" element={<ArticleEditorPage />} />
                <Route path="/character-sheets" element={<CharacterSheetList />} />
                <Route path="/character-sheets/:sheetId" element={<CharacterSheetDetail />} />

              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CampaignProvider>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;