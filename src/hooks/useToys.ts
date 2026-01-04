import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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

export const useAllToys = () => {
  return useQuery({
    queryKey: ['toys', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('toys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
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
      const { data, error } = await supabase
        .from('toys')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('toys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
