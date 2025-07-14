import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import { Teams } from '../pages/Team/Members';
import ApplicationPage from '../pages/ApplicationPage';
import AcceptInvite from '../pages/AcceptInvite';
import { PermissionGuard } from '../components/guards/PermissionGuard';
import { ProtectedRoutes } from './ProtectedRoutes';
import ErrorPage from '../pages/ErrorPage';
import { TeamStatusList } from '@/pages/TeamStatusList';
import { PermissionTemplates } from '@/pages/PermissionTemplates';
import { InviteFormWrapper } from '../pages/Team/routes/InviteFormWrapper';
import Dashboard from '@/pages/Conversation';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} errorElement={<ErrorPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} errorElement={<ErrorPage />} />
      <Route path="/app/*" element={<ProtectedRoutes />} errorElement={<ErrorPage />}>
        <Route index element={<ApplicationPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="team/status" element={<TeamStatusList />} />
        <Route path="team/permission-templates" element={<PermissionTemplates />} />
        <Route
          path="team/invite"
          element={
            <PermissionGuard permission="member-list">
              <InviteFormWrapper />
            </PermissionGuard>
          }
        />
        <Route
          path="team"
          element={<PermissionGuard permission="member-list"><Teams /></PermissionGuard>}
        >

          <Route path="active" element={<Teams />}>
            <Route path="user/:memberId" element={<Teams />} />
          </Route>
          <Route path="inactive" element={<Teams />}>
            <Route path="user/:memberId" element={<Teams />} />
          </Route>
        </Route>

        <Route path="conversations" element={<Dashboard />} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
      </Route>
      <Route path="*" element={<ErrorPage statusCode={404} />} />
    </Routes>
  );
}

export default AppRoutes;
