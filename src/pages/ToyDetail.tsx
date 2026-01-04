import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageGallery } from '@/components/ImageGallery';
import { useToy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CONDITION_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { Phone, MessageCircle, MapPin, ArrowRight, Calendar, Tag, Loader2 } from 'lucide-react';

const ToyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: toy, isLoading, error } = useToy(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !toy) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-foreground mb-2">הצעצוע לא נמצא</h2>
          <p className="text-muted-foreground mb-6">ייתכן שהצעצוע כבר נמכר או הוסר</p>
          <Button variant="default" onClick={() => navigate('/browse')}>
            חזרה לחיפוש
          </Button>
        </div>
      </div>
    );
  }

  const formattedPhone = toy.seller_phone.replace(/^0/, '972');
  const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(`היי, ראיתי את הצעצוע "${toy.toy_name}" ואשמח לפרטים נוספים`)}`;
  const phoneLink = `tel:${toy.seller_phone}`;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          חזרה
        </Button>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-elevated overflow-hidden animate-slide-up">
          {/* Image Gallery */}
          <div className="relative">
            <ImageGallery images={toy.images} altText={toy.toy_name} />
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className="text-xl px-4 py-2 shadow-card">
                {CATEGORY_ICONS[toy.category]}
              </Badge>
            </div>
            <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent p-6 pointer-events-none">
              <span className="text-4xl font-bold text-primary-foreground">
                ₪{toy.price}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {toy.toy_name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">
                  <Tag className="w-3 h-3 ml-1" />
                  {CATEGORY_LABELS[toy.category]}
                </Badge>
                <Badge
                  className={`text-sm ${
                    toy.condition === 'new'
                      ? 'bg-success text-success-foreground'
                      : toy.condition === 'like-new'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {CONDITION_LABELS[toy.condition]}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 py-4 border-y border-border">
              <div className="flex items-center gap-3 text-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{toy.city}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>פורסם ב-{new Date(toy.created_at).toLocaleDateString('he-IL')}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full"
                >
                  <MessageCircle className="w-5 h-5" />
                  שלח הודעה בוואטסאפ
                </Button>
              </a>
              <a href={phoneLink} className="block">
                <Button
                  variant="phone"
                  size="lg"
                  className="w-full"
                >
                  <Phone className="w-5 h-5" />
                  התקשר למוכר
                </Button>
              </a>
            </div>

            {/* Safety Notice */}
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 טיפ: תמיד פגשו במקום ציבורי ובדקו את הצעצוע לפני הרכישה
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToyDetail;
