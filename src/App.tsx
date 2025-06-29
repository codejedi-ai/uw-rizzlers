import { Router, Route } from 'preact-router'
import { AuthProvider } from './contexts/AuthContext'
import { AudioButton } from './components/AudioButton'
import { ChatButton } from './components/ChatButton'
import Home from './pages/Home'
import Survey from './pages/Survey'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Landing from './pages/Landing'

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <AudioButton />
        <Router>
          <Route path="/" component={Landing} />
          <Route path="/survey" component={Survey} />
          <Route path="/home" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/chat" component={Chat} />
        </Router>
        <ChatButton />
      </div>
    </AuthProvider>
  )
}