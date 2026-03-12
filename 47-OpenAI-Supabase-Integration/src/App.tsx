import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { PublicRoute } from './components/Auth/PublicRoute';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { UserLimitsProvider } from './contexts/UserLimitsContext';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ChatPage } from './pages/ChatPage';
import { TranscriptPage } from './pages/TranscriptPage';
import { HistoryPage } from './pages/HistoryPage';
import { FileUploader } from './components/FileUpload';

function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <UserLimitsProvider>
          <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transcript"
            element={
              <ProtectedRoute>
                <TranscriptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <FileUploader />
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
          </BrowserRouter>
        </UserLimitsProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
