'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useRoleLoginMutation } from '@/store/apiSlice'
import { setCredentials } from '@/store/authSlice'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { unlockAudio } from '@/lib/audioUnlock'
const loginFormSchema = yup.object({
  email: yup.string().email('Please enter valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

type LoginFormFields = yup.InferType<typeof loginFormSchema>

// Redirect each role to their home page
const getRoleRedirect = (role: string): string => {
  switch (role) {
    case 'menu_master':
      return '/menu-category'
    case 'kitchen_master':
      return '/notifications'
    case 'reception_master':
      return '/reciptionist'
    default:
      return '/menu-category'
  }
}

const useSignIn = () => {
  const [roleLogin, { isLoading }] = useRoleLoginMutation()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { showNotification } = useNotificationContext()

  const { control, handleSubmit } = useForm<LoginFormFields>({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      const result = await roleLogin(values).unwrap()

      // Save token
      localStorage.setItem('token', result.token)

      dispatch(
        setCredentials({
          token: result.token,
          user: result.data,
        }),
      )

      showNotification({
        message: result.message || 'Login successful',
        variant: 'success',
      })

      unlockAudio()
      const redirectPath = getRoleRedirect(result.data.role)
      router.push(redirectPath)
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || 'Invalid email or password',
        variant: 'danger',
      })
    }
  })

  return {
    loading: isLoading,
    login,
    control,
  }
}

export default useSignIn
