import { useContext } from 'react';
import { UserStatusContext } from './UserStatusProvider';

export const useUserStatus = () => useContext(UserStatusContext);
