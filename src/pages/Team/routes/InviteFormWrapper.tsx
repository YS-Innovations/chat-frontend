// src/pages/contacts/components/InviteFormWrapper.tsx
import { useNavigate } from 'react-router-dom';
import { InviteForm } from '../invite/invite-form'; // adjust path if needed

export function InviteFormWrapper() {
  const navigate = useNavigate();

  const handleInviteSuccess = () => {
    navigate('/app/contacts'); // go back to contacts on success
  };

  const handleClose = () => {
    navigate('/app/contacts'); // go back on close
  };

  return (
    <InviteForm
      onClose={handleClose}
      onInviteSuccess={handleInviteSuccess}
    />
  );
}
