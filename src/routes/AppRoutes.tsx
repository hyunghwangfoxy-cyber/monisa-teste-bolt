import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from '../pages/Welcome/Welcome'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Home from '../pages/Home/Home'
import Profile from '../pages/Profile/Profile'
import Settings from '../pages/Settings/Settings'
import Quiz from '../pages/Quiz/Quiz'
import LearningHub from '../pages/Profile/LearningHub'
import Play from '../pages/Play/Play'
import FAQ from '../pages/FAQ/FAQ'
import Discover from '../pages/Discover/Discover'
import StudyLayout from '../components/StudyLayout'
import { useMonisa } from '../context/MonisaContext'

export default function AppRoutes() {
  const { loading, user, profile, profileLoading } = useMonisa()
  if (loading) return <div className="page-loading" role="status">Preparando a Monisa…</div>
  const destination = profile?.learningProfile?.completedAt ? '/home' : '/quiz'
  return <Routes>
    <Route path="/" element={user ? <Navigate to={destination} replace /> : <Welcome />} />
    <Route path="/welcome" element={user ? <Navigate to={destination} replace /> : <Welcome />} />
    <Route path="/login" element={user ? <Navigate to={destination} replace /> : <Login />} />
    <Route path="/register" element={user ? <Navigate to={destination} replace /> : <Register />} />
    <Route element={<StudyLayout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/chat" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/quiz" element={profileLoading && !profile ? <div className="page-loading" role="status">Preparando seu perfil de aprendizagem…</div> : profile?.learningProfile?.completedAt ? <LearningHub /> : <Quiz />} />
      <Route path="/play" element={<Play />} />
      <Route path="/loading" element={<Navigate to="/home" replace />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
