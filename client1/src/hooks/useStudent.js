// // src/hooks/useStudent.js
// import { useState, useCallback } from 'react'
// import { api } from '../services/api'

// export const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' }

// export function useStudent() {
//   const [status, setStatus]   = useState(STATUS.IDLE)
//   const [student, setStudent] = useState(null)
//   const [rank, setRank]       = useState(null)
//   const [error, setError]     = useState(null)
//   const [pin, setPin]         = useState('')

//   const fetchStudent = useCallback(async (rollNo) => {
//     setStatus(STATUS.LOADING)
//     setError(null)
//     setStudent(null)
//     setRank(null)
//     setPin(rollNo)

//     const [studentRes, rankRes] = await Promise.allSettled([
//       api.getStudent(rollNo),
//       api.getRank(rollNo),
//     ])

//     if (studentRes.status === 'rejected') {
//       const msg = studentRes.reason?.message || 'Student not found.'
//       setError(msg)
//       setStatus(STATUS.ERROR)
//       return
//     }

//     setStudent(studentRes.value)
//     setRank(rankRes.status === 'fulfilled' ? rankRes.value : null)
//     setStatus(STATUS.SUCCESS)
//   }, [])

//   const reset = useCallback(() => {
//     setStatus(STATUS.IDLE)
//     setStudent(null)
//     setRank(null)
//     setError(null)
//     setPin('')
//   }, [])

//   return {
//     status, student, rank, error, pin,
//     isIdle:    status === STATUS.IDLE,
//     isLoading: status === STATUS.LOADING,
//     isSuccess: status === STATUS.SUCCESS,
//     isError:   status === STATUS.ERROR,
//     fetchStudent, reset,
//   }
// }



// src/hooks/useStudent.js
import { useState, useCallback } from 'react'
import { api } from '../services/api'

export const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' }

export function useStudent() {
  const [status, setStatus]   = useState(STATUS.IDLE)
  const [student, setStudent] = useState(null)
  const [subjects, setSubjects] = useState(null)   // { regd_no, name, subjects[] }
  const [rank, setRank]       = useState(null)
  const [error, setError]     = useState(null)
  const [pin, setPin]         = useState('')

  const fetchStudent = useCallback(async (rollNo) => {
    setStatus(STATUS.LOADING)
    setError(null)
    setStudent(null)
    setSubjects(null)
    setRank(null)
    setPin(rollNo)

    // Fetch student info, rank, and subject breakdown in parallel
    const [studentRes, rankRes, subjectsRes] = await Promise.allSettled([
      api.getStudent(rollNo),
      api.getRank(rollNo),
      api.getStudentSubjects(rollNo),
    ])

    if (studentRes.status === 'rejected') {
      const msg = studentRes.reason?.message || 'Student not found.'
      setError(msg)
      setStatus(STATUS.ERROR)
      return
    }

    setStudent(studentRes.value)
    setRank(rankRes.status === 'fulfilled' ? rankRes.value : null)
    setSubjects(subjectsRes.status === 'fulfilled' ? subjectsRes.value : null)
    setStatus(STATUS.SUCCESS)
  }, [])

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE)
    setStudent(null)
    setSubjects(null)
    setRank(null)
    setError(null)
    setPin('')
  }, [])

  return {
    status, student, subjects, rank, error, pin,
    isIdle:    status === STATUS.IDLE,
    isLoading: status === STATUS.LOADING,
    isSuccess: status === STATUS.SUCCESS,
    isError:   status === STATUS.ERROR,
    fetchStudent, reset,
  }
}
