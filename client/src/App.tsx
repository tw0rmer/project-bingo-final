import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConnectionStatus } from './components/ConnectionStatus';
import ProtectedRoute from './components/ProtectedRoute';


// Pages
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
import GamesPage from './pages/games';
import HowToPlayPage from './pages/how-to-play';
import NotFoundPage from './pages/not-found';
import AdminPage from './pages/admin';
import LobbyPage from './pages/lobby';
import LobbySelectPage from './pages/lobby-select';
import GamePage from './pages/game';
import AddBalancePage from './pages/add-balance';
import ProfilePage from './pages/profile';
import AchievementsPage from './pages/achievements';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <ConnectionStatus />
            <Router>
              <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/games" component={GamesPage} />
              <Route path="/how-to-play" component={HowToPlayPage} />
              <Route path="/dashboard">
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin">
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              </Route>
              <Route path="/lobby/:id">
                <ProtectedRoute>
                  <LobbyPage />
                </ProtectedRoute>
              </Route>
              <Route path="/lobby-select/:id">
                <ProtectedRoute>
                  <LobbySelectPage />
                </ProtectedRoute>
              </Route>
              <Route path="/games/:id">
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              </Route>
              <Route path="/add-balance">
                <ProtectedRoute>
                  <AddBalancePage />
                </ProtectedRoute>
              </Route>
              <Route path="/profile">
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Route>
              <Route path="/achievements">
                <ProtectedRoute>
                  <AchievementsPage />
                </ProtectedRoute>
              </Route>
              <Route component={NotFoundPage} />
            </Switch>
            </Router>
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
