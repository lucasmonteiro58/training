import { useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuthStore } from '../stores'

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])

  const loginComGoogle = async () => {
    const provider = new GoogleAuthProvider()
    provider.addScope('profile')
    provider.addScope('email')
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Erro no login Google:', err)
      throw err
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }

  return { user, loading, loginComGoogle, logout }
}
