// src/App.jsx
import { useStudent } from './hooks/useStudent'
import LoginPage    from './pages/LoginPage'
import LoadingPage  from './pages/LoadingPage'
import ErrorPage    from './pages/ErrorPage'
import DashboardPage from './pages/DashboardPage'
import { useEffect } from 'react'



export default function App() {
  const {
    isIdle, isLoading, isError, isSuccess,
    student, rank, error, pin,
    fetchStudent, reset,
  } = useStudent()

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const pin = params.get("pin")

  if (pin) {
    fetchStudent(pin)
  }
}, [])

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
