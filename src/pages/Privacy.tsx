import { Header } from '@/components/Header';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔒</span>
          <h1 className="text-3xl font-bold text-foreground mb-2">מדיניות פרטיות</h1>
          <p className="text-muted-foreground">כיצד אנחנו שומרים על הפרטיות שלכם</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">איסוף מידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו אוספים מידע שאתם מספקים בעת פרסום צעצוע: שם הצעצוע, מחיר, עיר, מספר טלפון ותמונות. 
              מידע זה נדרש לצורך פרסום המודעה ויצירת קשר עם קונים פוטנציאליים.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">שימוש במידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              המידע שנאסף משמש אך ורק לצורך הפעלת האתר והצגת המודעות. 
              מספר הטלפון מוצג לקונים פוטנציאליים ליצירת קשר ישיר.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">שיתוף מידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              איננו מוכרים, משכירים או משתפים את המידע שלכם עם צדדים שלישיים למטרות שיווקיות. 
              המידע משמש רק לצורך הפעלת השירות.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">אבטחת מידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע שלכם. 
              עם זאת, אין באפשרותנו להבטיח אבטחה מוחלטת של מידע המועבר באינטרנט.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">מחיקת מידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              ניתן לפנות אלינו בכל עת לבקשת מחיקת מודעה או מידע אישי. 
              נטפל בבקשות תוך זמן סביר.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
