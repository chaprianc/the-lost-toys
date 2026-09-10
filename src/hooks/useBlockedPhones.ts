import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adminRequest } from '@/lib/adminApi';

export interface BlockedPhone {
  id: string;
  phone: string;
  reason: string | null;
  blocked_at: string;
  blocked_by: string | null;
}

export const useBlockedPhones = (enabled = true) => {
  return useQuery({
    queryKey: ['blocked-phones'],
    queryFn: async () => {
      const data = await adminRequest<{ blockedPhones: BlockedPhone[] }>('list_blocked_phones');
      return data.blockedPhones;
    },
    enabled,
  });
};

export const useBlockPhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone, reason }: { phone: string; reason?: string }) => {
      const data = await adminRequest<{ blockedPhone: BlockedPhone }>('block_phone', { phone, reason });
      return data.blockedPhone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-phones'] });
    },
  });
};

export const useUnblockPhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminRequest('unblock_phone', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-phones'] });
    },
  });
};

export const useIsPhoneBlocked = (phone: string) => {
  return useQuery({
    queryKey: ['is-phone-blocked', phone],
    queryFn: async () => {
      if (!phone) return false;
      
      const { data, error } = await supabase
        .from('blocked_phones')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!phone,
  });
};
