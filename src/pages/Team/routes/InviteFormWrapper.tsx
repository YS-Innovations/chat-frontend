// src/pages/team/components/InviteFormWrapper.tsx
import { useNavigate } from 'react-router-dom';
import { InviteForm } from '../invite/invite-form'; // adjust path if needed

export function InviteFormWrapper() {
  const navigate = useNavigate();

  const handleInviteSuccess = () => {
    navigate('/app/team'); // go back to team on success
  };

  const handleClose = () => {
    navigate('/app/team'); // go back on close
  };

  return (
    <InviteForm
      onClose={handleClose}
      onInviteSuccess={handleInviteSuccess}
    />
  );
}
