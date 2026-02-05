import {useMutation, useQuery} from '@tanstack/react-query';
import {authApi} from '../services/authApi';
import {useAuthStore} from '../store/authStore';
import {PERMISSIONS} from '../../../shared/constants/permissions';

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const {setUser, setPermissions} = useAuthStore();

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
      database?: any; // Keep for backwards compatibility but not used
    }) => {
      const response = await authApi.login(username, password);
      return response;
    },
    onSuccess: data => {
      if (data.status === 'success' && data.user) {
        setUser(data.user);
        if (data.permissions) {
          setPermissions(data.permissions);
        }
      }
    },
  });
};

/**
 * Hook for getting home info
 */
export const useHomeInfo = () => {
  const {user, isAuthenticated, setHomeInfo, setPermissions} = useAuthStore();

  return useQuery({
    queryKey: ['homeInfo', user?.userNo],
    queryFn: async () => {
      if (!user?.userNo) {
        throw new Error('User not logged in');
      }
      const data = await authApi.getHomeInfo(user.userNo);
      setHomeInfo(data);

      // Update permissions based on rights from API
      const permissions: string[] = [];
      if (data.right719) {
        permissions.push(PERMISSIONS.VIEW_DOCUMENTS);
      }
      if (data.right729) {
        permissions.push(PERMISSIONS.EDIT_DOCUMENTS);
      }
      setPermissions(permissions);

      return data;
    },
    enabled: isAuthenticated && !!user?.userNo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const {logout} = useAuthStore();

  return () => {
    logout();
  };
};
