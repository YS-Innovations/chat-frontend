// src/pages/CannedResponse/CannedResponsePage.tsx
import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { toast } from 'sonner'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type CannedResponse = {
  id: string
  name: string
  message: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
}

export const CannedResponsePage = () => {
  const { user, getAccessTokenSilently } = useAuth0()

  const [responses, setResponses] = useState<CannedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null)
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE'
  })

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

  const handleCreateResponse = async () => {
    try {
      const token = await getAccessTokenSilently()
      await axios.post(
        `${import.meta.env.VITE_API_URL}/canned-responses`,
        {
          ...formData,
          userId: user?.sub,
          organizationId: user?.org_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('Canned response created successfully')
      setIsDialogOpen(false)
      resetForm()
      await fetchResponses()
    } catch (error) {
      toast.error('Failed to create canned response')
    }
  }

  const handleUpdateResponse = async () => {
    if (!editingResponse) return

    try {
      const token = await getAccessTokenSilently()
      await axios.put(
        `${import.meta.env.VITE_API_URL}/canned-responses/${editingResponse.id}`,
        {
          name: formData.name,
          message: formData.message,
          visibility: formData.visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('Canned response updated successfully')
      setIsDialogOpen(false)
      resetForm()
      await fetchResponses()
    } catch (error) {
      toast.error('Failed to update canned response')
    }
  }

  const handleDeleteClick = (id: string) => {
    setResponseToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteResponse = async () => {
    if (!responseToDelete) return

    try {
      const token = await getAccessTokenSilently()
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/canned-responses/${responseToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('Canned response deleted')
      setIsDeleteDialogOpen(false)
      setResponseToDelete(null)
      await fetchResponses()
    } catch (error) {
      toast.error('Failed to delete canned response')
    }
  }

  const handleEditClick = (response: CannedResponse) => {
    setEditingResponse(response)
    setFormData({
      name: response.name,
      message: response.message,
      visibility: response.visibility
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingResponse(null)
    setFormData({ name: '', message: '', visibility: 'PRIVATE' })
  }

  const filteredResponses = responses.filter(response =>
    response.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Canned Responses</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>Create New</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? 'Edit Canned Response' : 'New Canned Response'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Response name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                placeholder="Message content"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={formData.visibility === 'PRIVATE'}
                    onChange={() => setFormData({ ...formData, visibility: 'PRIVATE' })}
                  />
                  <span>Private</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={formData.visibility === 'PUBLIC'}
                    onChange={() => setFormData({ ...formData, visibility: 'PUBLIC' })}
                  />
                  <span>Public</span>
                </label>
              </div>
              <Button onClick={editingResponse ? handleUpdateResponse : handleCreateResponse} className="w-full">
                {editingResponse ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search responses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">{response.name}</TableCell>
                  <TableCell className="truncate max-w-[300px]">{response.message}</TableCell>
                  <TableCell>{response.visibility}</TableCell>
                  <TableCell>{new Date(response.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(response)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(response.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Confirmation</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this canned response?</p>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteResponse}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
