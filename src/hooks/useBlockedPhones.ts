import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlockedPhone {
  id: string;
  phone: string;
  reason: string | null;
  blocked_at: string;
  blocked_by: string | null;
}

export const useBlockedPhones = () => {
  return useQuery({
    queryKey: ['blocked-phones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_phones')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) throw error;
      return data as BlockedPhone[];
    },
  });
};

export const useBlockPhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone, reason }: { phone: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('blocked_phones')
        .insert({ phone, reason })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('blocked_phones')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
