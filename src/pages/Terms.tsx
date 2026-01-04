import { Header } from '@/components/Header';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">📋</span>
          <h1 className="text-3xl font-bold text-foreground mb-2">תקנון האתר</h1>
          <p className="text-muted-foreground">תנאי השימוש באתר אוצרות אבודים</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. כללי</h2>
            <p className="text-muted-foreground leading-relaxed">
              אתר "אוצרות אבודים" הינו פלטפורמה המאפשרת להורים למכור ולקנות צעצועים יד שנייה. 
              השימוש באתר מהווה הסכמה לתנאים המפורטים להלן.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. פרסום מודעות</h2>
            <p className="text-muted-foreground leading-relaxed">
              המשתמש מתחייב לפרסם רק צעצועים שברשותו באופן חוקי. 
              יש לתאר את מצב הצעצוע בצורה מדויקת ולהעלות תמונות אמיתיות של הפריט.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. עסקאות</h2>
            <p className="text-muted-foreground leading-relaxed">
              האתר משמש כפלטפורמה לחיבור בין קונים למוכרים בלבד. 
              העסקה מתבצעת ישירות בין הצדדים והאתר אינו אחראי לטיב המוצרים או לתנאי העסקה.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. אחריות</h2>
            <p className="text-muted-foreground leading-relaxed">
              האתר אינו אחראי לכל נזק שייגרם כתוצאה משימוש באתר או מעסקאות שנעשו דרכו. 
              מומלץ להיפגש במקום ציבורי ולבדוק את הצעצוע לפני הרכישה.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. שינויים בתקנון</h2>
            <p className="text-muted-foreground leading-relaxed">
              האתר שומר לעצמו את הזכות לעדכן את התקנון מעת לעת. 
              המשך השימוש באתר לאחר עדכון מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
