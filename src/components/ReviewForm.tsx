import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddReview } from "@/hooks/useSellerReviews";
import { toast } from "sonner";

interface ReviewFormProps {
  sellerPhone: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ sellerPhone, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const addReview = useAddReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("יש לבחור דירוג");
      return;
    }

    if (!name.trim()) {
      toast.error("יש להזין שם");
      return;
    }

    if (name.trim().length > 50) {
      toast.error("השם ארוך מדי (עד 50 תווים)");
      return;
    }

    if (comment.length > 500) {
      toast.error("התגובה ארוכה מדי (עד 500 תווים)");
      return;
    }

    try {
      await addReview.mutateAsync({
        seller_phone: sellerPhone,
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success("הדירוג נשלח בהצלחה!");
      setRating(0);
      setName("");
      setComment("");
      onSuccess?.();
    } catch (error) {
      toast.error("שגיאה בשליחת הדירוג");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <h4 className="font-semibold text-foreground">הוסף דירוג</h4>
      
      {/* Star Rating */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">דירוג:</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name Input */}
      <div>
        <Input
          placeholder="השם שלך"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="bg-background"
        />
      </div>

      {/* Comment Input */}
      <div>
        <Textarea
          placeholder="ספר על החוויה שלך (אופציונלי)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          className="bg-background resize-none"
        />
        <div className="text-xs text-muted-foreground text-left mt-1">
          {comment.length}/500
        </div>
      </div>

      <Button
        type="submit"
        disabled={addReview.isPending}
        className="w-full"
      >
        {addReview.isPending ? "שולח..." : "שלח דירוג"}
      </Button>
    </form>
  );
};

export default ReviewForm;
