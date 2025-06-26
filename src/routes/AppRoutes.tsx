import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import { Contacts } from '../pages/contacts/contacts';
import ApplicationPage from '../pages/ApplicationPage';
import AllConversations from '../pages/AllConversations';
import AcceptInvite from '../pages/AcceptInvite';
import { PermissionEditPage } from '../pages/permissions/permission-edit-page';
import { PermissionViewPage } from '../pages/permissions/permission-view-page';
import { PermissionGuard } from '../components/PermissionGuard';
import { ProtectedRoutes } from './ProtectedRoutes';
import { AdminOnlyRoute } from './AdminOnlyRoute';
import ErrorPage from '../pages/ErrorPage';
import { TeamStatusList } from '@/pages/TeamStatusList';
import { PermissionTemplates } from '@/pages/PermissionTemplates';

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
                <Route path="contacts" element={<PermissionGuard permission="member-list"> <Contacts /> </PermissionGuard>} />
                <Route path="conversations" element={<AllConversations />} />
                <Route path="*" element={<ErrorPage statusCode={404} />} />
            </Route>
            <Route path="/permissions/edit/:userId" element={<AdminOnlyRoute> <PermissionEditPage /> </AdminOnlyRoute>} errorElement={<ErrorPage />} />
            <Route path="/permissions/view/:userId" element={<AdminOnlyRoute> <PermissionViewPage /> </AdminOnlyRoute>} errorElement={<ErrorPage />} />
            <Route path="*" element={<ErrorPage statusCode={404} />} />
        </Routes>
    );
}

export default AppRoutes;
