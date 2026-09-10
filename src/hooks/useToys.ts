import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { adminRequest } from '@/lib/adminApi';

export type Toy = Tables<'toys'>;
export type ToyInsert = TablesInsert<'toys'>;
export type ToyUpdate = TablesUpdate<'toys'>;

export const useToys = () => {
  return useQuery({
    queryKey: ['toys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('toys')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAllToys = (enabled = true) => {
  return useQuery({
    queryKey: ['toys', 'all'],
    queryFn: async () => {
      const data = await adminRequest<{ toys: Toy[] }>('list_toys');
      return data.toys;
    },
    enabled,
  });
};

export const useToy = (id: string) => {
  return useQuery({
    queryKey: ['toys', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('toys')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export interface ManagedToyCreationResult {
  toy: Toy;
  managementToken: string;
}

export const useCreateManagedToy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toy: ToyInsert): Promise<ManagedToyCreationResult> => {
      const { data, error } = await supabase.functions.invoke('create-toy', { body: toy });

      if (error) throw error;
      if (!data?.toy || !data?.managementToken) {
        throw new Error(data?.error || 'לא ניתן ליצור קישור לניהול המודעה');
      }

      return data as ManagedToyCreationResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toys'] });
    },
  });
};

export const useAddToy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (toy: ToyInsert) => {
      const { data, error } = await supabase
        .from('toys')
        .insert(toy)
        .select()
        .single();
      
      if (error) throw error;
      
      // Send WhatsApp notification to admin (fire and forget)
      try {
        await supabase.functions.invoke('notify-admin-whatsapp', {
          body: {
            toyName: toy.toy_name,
            price: toy.price,
            city: toy.city,
            sellerPhone: toy.seller_phone,
          },
        });
      } catch (notifyError) {
        console.log('WhatsApp notification failed (non-critical):', notifyError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toys'] });
    },
  });
};

export const useUpdateToyStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'available' | 'sold' | 'hidden' }) => {
      const data = await adminRequest<{ toy: Toy }>('update_toy_status', { id, status });
      return data.toy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toys'] });
    },
  });
};

export const useDeleteToy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await adminRequest('delete_toy', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toys'] });
    },
  });
};

export const uploadToyImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('toy-images')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('toy-images')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};
