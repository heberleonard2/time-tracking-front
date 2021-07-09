import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { toast } from 'react-toastify'
import Router from 'next/router'
import { api } from '../services/api'

interface AuthProviderProps {
  children: ReactNode
}
interface User {
  id?: string
  name: string
  email: string
}
interface SignInData {
  email: string
  password: string
}
interface SignUpData extends SignInData {
  name: string
}
interface AuthContextData {
  isAuthenticated: boolean
  user: User | null
  signIn: (data: SignInData) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => void
}
interface SessionResponse {
  token: string
  user: User
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  const isAuthenticated = !!user

  useEffect(() => {
    const { 'solides.token': token } = parseCookies()

    if (token) {
      api.get('/users').then(response => setUser(response.data.user))
    }
  }, [])

  async function signIn({ email, password }: SignInData) {
    try {
      const {
        data: { token, user }
      } = await api.post<SessionResponse>('/sessions', {
        email,
        password
      })

      setCookie(undefined, 'solides.token', token, {
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      api.defaults.headers.Authorization = `Bearer ${token}`

      setUser(user)
      Router.push('/dashboard')
    } catch (err) {
      toast.error('Incorrect email or password')
    }
  }

  async function signUp({ name, email, password }: SignUpData) {
    try {
      const response = await api.post<User>('/users', {
        name,
        email,
        password
      })
      if (response.data.email) {
        await signIn({
          email,
          password
        })
      }
    } catch (err) {
      toast.error('There was an error in the registration, please try again')
    }
  }

  async function signOut() {
    try {
      destroyCookie(undefined, 'solides.token')
      await Router.push('/')
      setUser(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, signUp, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)
  return context
}
