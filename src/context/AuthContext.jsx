import { useEffect, useMemo, useState } from 'react'

import { apiRequest } from '../lib/api'
import { AuthContext } from './authContext.js'

function readStoredAuth() {
  try {
    const raw = window.localStorage.getItem('miitverse-auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth())
  const [ready, setReady] = useState(() => !readStoredAuth())

  useEffect(() => {
    if (!auth) {
      window.localStorage.removeItem('miitverse-auth')
      return
    }

    window.localStorage.setItem('miitverse-auth', JSON.stringify(auth))
  }, [auth])

  useEffect(() => {
    let cancelled = false

    async function syncCurrentUser() {
      if (!auth?.token) {
        setReady(true)
        return
      }

      try {
        const data = await apiRequest('/users/me', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })

        if (!cancelled) {
          setAuth((currentAuth) => ({
            token: currentAuth?.token ?? auth.token,
            user: data.user,
          }))
        }
      } catch {
        if (!cancelled) {
          setAuth(null)
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    syncCurrentUser()

    return () => {
      cancelled = true
    }
  }, [auth?.token])

  const value = useMemo(() => {
    return {
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      ready,
      login: async (credentials) => {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        })

        setAuth({ token: data.token, user: data.user })
        return data
      },
      register: async (payload) => {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        return data
      },
      updateProfile: async (payload) => {
        const data = await apiRequest('/users/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify(payload),
        })

        setAuth((currentAuth) => ({
          token: currentAuth?.token ?? auth?.token,
          user: data.user,
        }))

        return data.user
      },
      changePassword: async (payload) => {
        const data = await apiRequest('/users/me/password', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify(payload),
        })

        return data
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('miitverse-auth')
        }
        setAuth(null)
        setReady(true)
      },
    }
  }, [auth, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
