import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface Template {
  id: string;
  policyName: string;
  createdAt: string;
}

interface TemplateDetail extends Template {
  // Add more fields as needed if backend returns more info in detail API
  description?: string; // example field
}

export const PermissionTemplates: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState<TemplateDetail | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list of templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isAuthenticated) return;
      setLoadingList(true);
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch('http://localhost:3000/auth/permissions/templates', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingList(false);
      }
    };
    fetchTemplates();
  }, [getAccessTokenSilently, isAuthenticated]);

  // Fetch details when a template is selected
  useEffect(() => {
    if (!selectedTemplateId || !isAuthenticated) {
      setSelectedTemplateDetail(null);
      return;
    }

    const fetchTemplateDetail = async () => {
      setLoadingDetail(true);
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`http://localhost:3000/auth/permissions/templates/${selectedTemplateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch template detail');
        const data = await res.json();
        setSelectedTemplateDetail(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchTemplateDetail();
  }, [selectedTemplateId, getAccessTokenSilently, isAuthenticated]);

  if (loadingList) return <p>Loading permission templates...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* List panel */}
      <div style={{ flex: 1 }}>
        <h2>Permission Templates</h2>
        {templates.length === 0 && <p>No templates found.</p>}
        <ul>
          {templates.map(t => (
            <li
              key={t.id}
              style={{
                cursor: 'pointer',
                fontWeight: selectedTemplateId === t.id ? 'bold' : 'normal',
                marginBottom: '0.5rem',
              }}
              onClick={() => setSelectedTemplateId(t.id)}
            >
              {t.policyName}
            </li>
          ))}
        </ul>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 2, borderLeft: '1px solid #ccc', paddingLeft: '1rem' }}>
        {loadingDetail && <p>Loading details...</p>}
        {!loadingDetail && selectedTemplateDetail && (
          <>
            <h3>{selectedTemplateDetail.policyName}</h3>
            <p><strong>Created At:</strong> {new Date(selectedTemplateDetail.createdAt).toLocaleString()}</p>
            {/* Example detail fields */}
            {selectedTemplateDetail.description && <p><strong>Description:</strong> {selectedTemplateDetail.description}</p>}
            {/* Add more fields as your backend returns */}
            
          </>
        )}
        {!loadingDetail && !selectedTemplateDetail && <p>Select a template to see details.</p>}
      </div>
    </div>
  );
};
