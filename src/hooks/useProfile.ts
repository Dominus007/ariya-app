import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchProfileRecord, updateDisplayName, uploadAvatar } from '../services/profile';
import { useAuthStore } from '../store/useAuthStore';

export function useProfileRecord() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['profile-record', userId],
    queryFn: () => fetchProfileRecord(userId as string),
    enabled: !!userId,
  });
}

export function useUploadAvatar() {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uri, mimeType }: { uri: string; mimeType?: string }) => {
      if (!userId) throw new Error('Not signed in');
      return uploadAvatar(userId, uri, mimeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-record', userId] });
    },
  });
}

export function useUpdateDisplayName() {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!userId) throw new Error('Not signed in');
      return updateDisplayName(userId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-record', userId] });
    },
  });
}
