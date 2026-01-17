import { Star } from "lucide-react";
import { useSellerAverageRating } from "@/hooks/useSellerReviews";

interface SellerRatingProps {
  sellerPhone: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

const SellerRating = ({ sellerPhone, showCount = true, size = "md" }: SellerRatingProps) => {
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

  return (
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
  );
};

export default SellerRating;
