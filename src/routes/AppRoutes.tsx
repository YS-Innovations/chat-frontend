import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home/Home';
import Profile from '../pages/Profile/Profile';
import { Teams } from '../pages/Team/Members';
import ApplicationPage from '../pages/inbox/ApplicationPage';
import AcceptInvite from '../pages/AcceptInvite';
import { PermissionGuard } from '../components/guards/PermissionGuard';
import { ProtectedRoutes } from './ProtectedRoutes';
import ErrorPage from '../pages/ErrorPage';
import { PermissionTemplates } from '@/pages/Team/permissionTemplates/PermissionTemplates';
import Onboarding from '@/pages/Onboarding/Onboarding';
import EditOrganization from '@/pages/Onboarding/EditOrganization';
import { Invitepending } from '@/pages/Team/invitePendingMembers/invitePendingMembers';
import { InviteForm } from '@/pages/Team/invite/invite-form';
import { CannedResponsePage } from '@/pages/CannedResponse/CannedResponsePage';
import Dashboard from '@/pages/chat/pages/Dashboard';
import ChannelsPage from '@/pages/channel/channel';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} errorElement={<ErrorPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} errorElement={<ErrorPage />} />
      <Route path="/onboarding" element={<Onboarding />} errorElement={<ErrorPage />} />
      <Route path="/app/*" element={<ProtectedRoutes />} errorElement={<ErrorPage />}>
        <Route index element={<ApplicationPage />} />
        <Route path="onboarding/edit" element={<EditOrganization />} errorElement={<ErrorPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="team/permission-templates" element={<PermissionTemplates />} />
        <Route path="team/invite" element={<PermissionGuard permission="member-list"> <InviteForm /> </PermissionGuard>} />
        <Route path="team/invite-pending" element={<Invitepending />}></Route>
        <Route path="team" element={<PermissionGuard permission="member-list"><Teams /></PermissionGuard>} />
        <Route path="team/user/:memberId" element={<PermissionGuard permission="member-list"> <Teams /> </PermissionGuard>} />
        <Route path="conversations" element={<Dashboard />} />
        <Route path="canned-responses" element={<CannedResponsePage />} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
        <Route path="channel-settings" element={<PermissionGuard permission="chennelsettings"><ChannelsPage /></PermissionGuard>} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
