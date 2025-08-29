// src/hooks/useCannedResponses.ts
import { useState, useEffect } from 'react'
import { useAuthShared } from '@/hooks/useAuthShared'
import { toast } from 'sonner'
import axios from 'axios'

export type CannedResponse = {
  id: string
  name: string
  message: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
}

export const useCannedResponses = () => {
  const { user, getAccessTokenSilently } = useAuthShared()
  const [responses, setResponses] = useState<CannedResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResponses = async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/canned-responses/available/${user?.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setResponses(response.data)
    } catch (error) {
      toast.error('Failed to fetch canned responses')
      setResponses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.sub) fetchResponses()
  }, [user?.sub])

  return {
    responses,
    loading,
    fetchResponses,
  }
}
