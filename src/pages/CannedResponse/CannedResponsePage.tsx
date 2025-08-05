// src/pages/CannedResponse/CannedResponsePage.tsx
import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'

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

  // Form state
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
      console.error('Failed to fetch canned responses:', error)
      // toast({
      //   title: 'Error',
      //   description: 'Failed to fetch canned responses',
      //   variant: 'destructive',
      // })
      setResponses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.sub) {
      fetchResponses()
    }
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
      // toast({
      //   title: 'Success',
      //   description: 'Canned response created successfully',
      // })
      setIsDialogOpen(false)
      setFormData({
        name: '',
        message: '',
        visibility: 'PRIVATE'
      })
      await fetchResponses()
    } catch (error) {
      console.error('Failed to create canned response:', error)
      // toast({
      //   title: 'Error',
      //   description: 'Failed to create canned response',
      //   variant: 'destructive',
      // })
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
        // Don't send userId and organizationId for updates as they shouldn't change
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    // Success handling...
  } catch (error) {
    console.error('Failed to update canned response:', error)
    // if (error.response) {
    //   console.error('Error details:', error.response.data)
    // }
    // toast error...
  }
}

  const handleDeleteClick = (responseId: string) => {
    setResponseToDelete(responseId)
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
      // toast({
      //   title: 'Success',
      //   description: 'Canned response deleted successfully',
      // })
      setIsDeleteDialogOpen(false)
      setResponseToDelete(null)
      await fetchResponses()
    } catch (error) {
      console.error('Failed to delete canned response:', error)
      // toast({
      //   title: 'Error',
      //   description: 'Failed to delete canned response',
      //   variant: 'destructive',
      // })
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

  const filteredResponses = responses.filter(response =>
    response.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Canned Responses</h1>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingResponse(null)
              setFormData({
                name: '',
                message: '',
                visibility: 'PRIVATE'
              })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Create New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? 'Edit Canned Response' : 'Create New Canned Response'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Textarea
                placeholder="Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={5}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="private"
                  name="visibility"
                  checked={formData.visibility === 'PRIVATE'}
                  onChange={() =>
                    setFormData({ ...formData, visibility: 'PRIVATE' })
                  }
                />
                <label htmlFor="private">Private</label>
                <input
                  type="radio"
                  id="public"
                  name="visibility"
                  checked={formData.visibility === 'PUBLIC'}
                  onChange={() =>
                    setFormData({ ...formData, visibility: 'PUBLIC' })
                  }
                />
                <label htmlFor="public">Public (Org-wide)</label>
              </div>
              <Button onClick={editingResponse ? handleUpdateResponse : handleCreateResponse}>
                {editingResponse ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search responses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
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
                  <TableCell>{response.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {response.message}
                  </TableCell>
                  <TableCell>{response.visibility}</TableCell>
                  <TableCell>
                    {new Date(response.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClick(response)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500"
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
                <DialogTitle>Confirm Delete</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this canned response?</p>
              <div className="flex justify-end space-x-2 mt-4">
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