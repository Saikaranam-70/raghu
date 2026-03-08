// src/App.jsx
import { useStudent } from './hooks/useStudent'
import LoginPage    from './pages/LoginPage'
import LoadingPage  from './pages/LoadingPage'
import ErrorPage    from './pages/ErrorPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const {
    isIdle, isLoading, isError, isSuccess,
    student, rank, error, pin,
    fetchStudent, reset,
  } = useStudent()

  console.log("Student",student);

  if (isLoading) return <LoadingPage />

  if (isError) return (
    <ErrorPage
      error={error}
      pin={pin}
      onRetry={() => fetchStudent(pin)}
      onBack={reset}
    />
  )

  if (isSuccess && student) return (
    <DashboardPage student={student} rank={rank} onBack={reset} />
  )

  // Default: login (isIdle)
  return <LoginPage onLogin={fetchStudent} />
}
