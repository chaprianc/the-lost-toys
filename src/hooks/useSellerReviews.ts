import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SellerReview {
  id: string;
  seller_phone: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export const useSellerReviews = (sellerPhone: string) => {
  return useQuery({
    queryKey: ["seller-reviews", sellerPhone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_phone", sellerPhone)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SellerReview[];
    },
    enabled: !!sellerPhone,
  });
};

export const useSellerAverageRating = (sellerPhone: string) => {
  return useQuery({
    queryKey: ["seller-average-rating", sellerPhone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_reviews")
        .select("rating")
        .eq("seller_phone", sellerPhone);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      return {
        average: sum / data.length,
        count: data.length,
      };
    },
    enabled: !!sellerPhone,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      seller_phone: string;
      reviewer_name: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("seller_reviews")
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["seller-reviews", variables.seller_phone],
      });
      queryClient.invalidateQueries({
        queryKey: ["seller-average-rating", variables.seller_phone],
      });
    },
  });
};
