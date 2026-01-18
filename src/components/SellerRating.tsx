import { Star, Award } from "lucide-react";
import { useSellerAverageRating } from "@/hooks/useSellerReviews";
import { Badge } from "@/components/ui/badge";

interface SellerRatingProps {
  sellerPhone: string;
  showCount?: boolean;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

const SellerRating = ({ sellerPhone, showCount = true, showBadge = true, size = "md" }: SellerRatingProps) => {
  const { data, isLoading } = useSellerAverageRating(sellerPhone);

  if (isLoading) {
    return <div className="h-5 w-20 bg-muted animate-pulse rounded" />;
  }

  if (!data || data.count === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        אין דירוגים עדיין
      </span>
    );
  }

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const isRecommended = data.average >= 4 && data.count >= 1;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${sizeClasses[size]} ${
                star <= Math.round(data.average)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
        {showCount && (
          <span className={`text-muted-foreground ${textClasses[size]}`}>
            ({data.count})
          </span>
        )}
      </div>
      {showBadge && isRecommended && (
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 gap-1">
          <Award className="w-3 h-3" />
          מוכר מומלץ
        </Badge>
      )}
    </div>
  );
};

export default SellerRating;
