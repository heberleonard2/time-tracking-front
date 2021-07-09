import Link from 'next/link'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Container, Content, Logo } from '../styles/pages/Home'
import { useAuth } from '../hooks/useAuth'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'

interface SignInFormData {
  email: string
  password: string
}

const signInFormSchema = yup.object().shape({
  email: yup.string().required('E-mail is required').email('Invalid e-mail'),
  password: yup.string().required('Password is required')
})

export default function Home() {
  const { signIn } = useAuth()

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(signInFormSchema)
  })
  const errors = formState.errors

  const handleSignIn: SubmitHandler<SignInFormData> = async ({
    email,
    password
  }) => {
    await signIn({ email, password })
  }

  return (
    <Container>
      <Content>
        <Logo />
        <h2>Sign in to your account</h2>
        <div>
          <form onSubmit={handleSubmit(handleSignIn)}>
            <Input
              type="email"
              label="E-mail address"
              error={errors.email}
              {...register('email')}
            />
            <Input
              type="password"
              label="Password"
              error={errors.password}
              {...register('password')}
            />
            <Button type="submit" isLoading={formState.isSubmitting}>
              Sign in
            </Button>
          </form>

          <p>
            Dont have account?{' '}
            <Link href="/signup">
              <a>Sign up now</a>
            </Link>
          </p>
        </div>
      </Content>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { 'solides.token': token } = parseCookies(ctx)

  if (token) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}
