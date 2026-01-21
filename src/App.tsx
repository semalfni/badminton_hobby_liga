import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuth } from './AuthContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import Login from './pages/Login'
import Teams from './pages/Teams'
import Players from './pages/Players'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Standings from './pages/Standings'
import Statistics from './pages/Statistics'
import Users from './pages/Users'

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  const location = useLocation()
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and hamburger */}
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                🏸 {t('common.appName')}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.standings')}
              </Link>
              <Link
                to="/teams"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/teams')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.teams')}
              </Link>
              <Link
                to="/players"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/players')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.players')}
              </Link>
              <Link
                to="/matches"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/matches')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.matches')}
              </Link>
              <Link
                to="/statistics"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/statistics')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('nav.statistics')}
              </Link>
              {isAdmin && (
                <Link
                  to="/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/users')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('nav.users')}
                </Link>
              )}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{user?.username}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">
                  {user?.role === 'admin' ? t('common.admin') : t('common.teamManager')}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {t('common.logout')}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') && location.pathname === '/'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('nav.standings')}
                </Link>
                <Link
                  to="/teams"
                  onClick={closeMobileMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/teams')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('nav.teams')}
                </Link>
                <Link
                  to="/players"
                  onClick={closeMobileMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/players')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('nav.players')}
                </Link>
                <Link
                  to="/matches"
                  onClick={closeMobileMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/matches')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('nav.matches')}
                </Link>
                <Link
                  to="/statistics"
                  onClick={closeMobileMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/statistics')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('nav.statistics')}
                </Link>
                {isAdmin && (
                  <Link
                    to="/users"
                    onClick={closeMobileMenu}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/users')
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('nav.users')}
                  </Link>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium">{user?.username}</div>
                    <div className="mt-1">
                      <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">
                        {user?.role === 'admin' ? t('common.admin') : t('common.teamManager')}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <LanguageSwitcher />
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Standings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <Players />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches/:id"
            element={
              <ProtectedRoute>
                <MatchDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requireAdmin>
                <Users />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
