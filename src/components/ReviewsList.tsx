import { Star, User } from "lucide-react";
import { useSellerReviews } from "@/hooks/useSellerReviews";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface ReviewsListProps {
  sellerPhone: string;
}

const ReviewsList = ({ sellerPhone }: ReviewsListProps) => {
  const { data: reviews, isLoading } = useSellerReviews(sellerPhone);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>אין ביקורות עדיין</p>
        <p className="text-sm">היה הראשון לדרג את המוכר!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-medium text-foreground">{review.reviewer_name}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(review.created_at), "d בMMMM yyyy", { locale: he })}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-foreground/80 pr-10">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
