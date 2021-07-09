import { GetServerSideProps } from 'next'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { parseCookies } from 'nookies'
import { api } from '../../services/api'

import { DashboardContainer } from '../../components/DashboardContainer'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  function handleSignOut() {
    signOut()
  }
  useEffect(() => {
    api.get('/dashboard')
  }, [])

  return (
    <>
      <DashboardContainer>
        <h1>Olá, {user?.name}</h1>
        <p>{user?.email}</p>
        <button onClick={handleSignOut}>Logout</button>
      </DashboardContainer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { 'solides.token': token } = parseCookies(ctx)

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}
