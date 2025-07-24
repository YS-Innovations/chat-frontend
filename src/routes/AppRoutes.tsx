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
import { InviteFormWrapper } from '../pages/Team/routes/InviteFormWrapper';
import Dashboard from '@/pages/Conversation';
import Onboarding from '@/pages/Onboarding/Onboarding';
import EditOrganization from '@/pages/Onboarding/EditOrganization';
import { Invitepending } from '@/pages/Team/invitePendingMembers/invitePendingMembers';


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
        <Route
          path="team/invite"
          element={
            <PermissionGuard permission="member-list">
              <InviteFormWrapper />
            </PermissionGuard>
          }
        />
        <Route path="team/invite-pending" element={<Invitepending />}></Route>
        <Route
          path="team"
          element={<PermissionGuard permission="member-list"><Teams /></PermissionGuard>}
        >

          <Route path="active" element={<Teams />}>
            <Route path="user/:memberId" element={<Teams />} />
          </Route>
          
        </Route>

        <Route path="conversations" element={<Dashboard />} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
