import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';

const Contact = () => {
  const email = 'chaprianc@gmail.com';
  const whatsappNumber = '972526901137';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('היי, פניתי מאתר אוצרות אבודים')}`;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">💬</span>
          <h1 className="text-3xl font-bold text-foreground mb-2">צור קשר</h1>
          <p className="text-muted-foreground">נשמח לשמוע מכם!</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-6">
          <p className="text-center text-muted-foreground">
            יש לכם שאלה? הצעה? בעיה? אנחנו כאן בשבילכם.
          </p>
          
          <div className="space-y-4">
            <a href={`mailto:${email}`} className="block">
              <Button variant="outline" size="lg" className="w-full">
                <Mail className="w-5 h-5" />
                שלחו לנו מייל
              </Button>
            </a>
            
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="whatsapp" size="lg" className="w-full">
                <MessageCircle className="w-5 h-5" />
                💬 WhatsApp
              </Button>
            </a>
          </div>
          
          <div className="pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              זמני מענה: ימים א'-ה' 9:00-18:00
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
