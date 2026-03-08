// src/hooks/useSubjects.js
//
// Handles class-wide subject data:
//   - Class stats (averages, totals, defaulter counts)
//   - Subject-wise defaulters (students below a threshold in one subject)
//   - Class totals (total classes held per subject)

import { useState, useCallback } from 'react'
import { api } from '../services/api'

export const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' }

// ── useClassStats ─────────────────────────────────────────────────────────────
// Fetches overall class statistics including subject-wise averages and totals.
//
// Returns:
//   {
//     total_students, overall_average, highest_attendance, lowest_attendance,
//     students_above_75, students_below_75, students_below_60,
//     subject_wise_stats: [{ subject, total_classes_held, average_percentage, students_counted }]
//   }
export function useClassStats() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [stats, setStats]   = useState(null)
  const [error, setError]   = useState(null)

  const fetchClassStats = useCallback(async () => {
    setStatus(STATUS.LOADING)
    setError(null)
    try {
      const data = await api.getClassStats()
      setStats(data)
      setStatus(STATUS.SUCCESS)
    } catch (err) {
      setError(err.message || 'Failed to load class stats.')
      setStatus(STATUS.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE)
    setStats(null)
    setError(null)
  }, [])

  return {
    status, stats, error,
    isIdle:    status === STATUS.IDLE,
    isLoading: status === STATUS.LOADING,
    isSuccess: status === STATUS.SUCCESS,
    isError:   status === STATUS.ERROR,
    fetchClassStats, reset,
  }
}

// ── useSubjectDefaulters ──────────────────────────────────────────────────────
// Fetches the list of students below a given threshold in one specific subject.
//
// Usage:
//   const { fetchSubjectDefaulters, defaulters, subject } = useSubjectDefaulters()
//   fetchSubjectDefaulters('ADSA')          // uses default 75% threshold
//   fetchSubjectDefaulters('JAVA', 60)      // custom threshold
//
// Each defaulter in the list is a full student object (same shape as getStudent).
export function useSubjectDefaulters() {
  const [status, setStatus]     = useState(STATUS.IDLE)
  const [defaulters, setDefaulters] = useState([])
  const [subject, setSubject]   = useState(null)
  const [threshold, setThreshold] = useState(75)
  const [error, setError]       = useState(null)

  const fetchSubjectDefaulters = useCallback(async (subjectName, thresh = 75) => {
    setStatus(STATUS.LOADING)
    setError(null)
    setDefaulters([])
    setSubject(subjectName)
    setThreshold(thresh)

    try {
      const data = await api.getSubjectDefaulters(subjectName, thresh)

      // Backend returns null for an invalid/unknown subject name
      if (data === null) {
        setError(`Unknown subject: "${subjectName}". Check the subject name and try again.`)
        setStatus(STATUS.ERROR)
        return
      }

      setDefaulters(data)
      setStatus(STATUS.SUCCESS)
    } catch (err) {
      setError(err.message || 'Failed to load subject defaulters.')
      setStatus(STATUS.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE)
    setDefaulters([])
    setSubject(null)
    setThreshold(75)
    setError(null)
  }, [])

  return {
    status, defaulters, subject, threshold, error,
    isIdle:    status === STATUS.IDLE,
    isLoading: status === STATUS.LOADING,
    isSuccess: status === STATUS.SUCCESS,
    isError:   status === STATUS.ERROR,
    fetchSubjectDefaulters, reset,
  }
}

// ── useClassTotals ────────────────────────────────────────────────────────────
// Fetches the raw total classes held per subject (from the "totals row" in the sheet).
//
// Returns:
//   {
//     grand_total: 426,
//     subjects: [{ subject: "DL&CO", total_classes: 40 }, ...]
//   }
export function useClassTotals() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [totals, setTotals] = useState(null)
  const [error, setError]   = useState(null)

  const fetchClassTotals = useCallback(async () => {
    setStatus(STATUS.LOADING)
    setError(null)
    try {
      const data = await api.getClassTotals()
      setTotals(data)
      setStatus(STATUS.SUCCESS)
    } catch (err) {
      setError(err.message || 'Failed to load class totals.')
      setStatus(STATUS.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE)
    setTotals(null)
    setError(null)
  }, [])

  return {
    status, totals, error,
    isIdle:    status === STATUS.IDLE,
    isLoading: status === STATUS.LOADING,
    isSuccess: status === STATUS.SUCCESS,
    isError:   status === STATUS.ERROR,
    fetchClassTotals, reset,
  }
}