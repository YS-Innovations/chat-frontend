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

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE'
  })

const fetchResponses = async () => {
  try {
    setLoading(true);
    const token = await getAccessTokenSilently();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/canned-responses/available/${user?.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setResponses(response.data);
  } catch (error) {
    console.error('Failed to fetch canned responses:', error);
    // toast({
    //   title: 'Error',
    //   description: 'Failed to fetch canned responses',
    //   variant: 'destructive',
    // });
    setResponses([]); // Reset to empty array on error
  } finally {
    setLoading(false);
  }
};

// Add this useEffect to fetch data only once when component mounts
useEffect(() => {
  if (user?.sub) {
    fetchResponses();
  }
}, [user?.sub]); // Only re-run if user.sub changes

const handleCreateResponse = async () => {
  try {
    const token = await getAccessTokenSilently();
    await axios.post(
      `${import.meta.env.VITE_API_URL}/canned-responses`,
      {
        ...formData,
        userId: user?.sub,
        organizationId: user?.org_id, // Make sure to include organizationId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // toast({
    //   title: 'Success',
    //   description: 'Canned response created successfully',
    // });
    setIsDialogOpen(false);
    setFormData({
      name: '',
      message: '',
      visibility: 'PRIVATE'
    });
    // Fetch fresh data instead of appending
    await fetchResponses();
  } catch (error) {
    // Error handling remains the same
  }
};

  const filteredResponses = responses.filter(response =>
    response.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Canned Responses</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Canned Response</DialogTitle>
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
              <Button onClick={handleCreateResponse}>Create</Button>
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
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}