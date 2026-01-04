import { Header } from '@/components/Header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'איך אני מפרסם צעצוע למכירה?',
    answer: 'לחצו על כפתור "פרסם צעצוע", העלו תמונה, מלאו את הפרטים הבסיסיים (שם, מחיר, מצב, עיר) והצעצוע יפורסם מיד.'
  },
  {
    question: 'כמה עולה לפרסם צעצוע?',
    answer: 'פרסום צעצוע עולה דמי שירות סמליים של 5-10 ש"ח. התשלום מתבצע מחוץ למערכת (ביט/פייבוקס).'
  },
  {
    question: 'איך יוצרים קשר עם המוכר?',
    answer: 'בעמוד הצעצוע תמצאו כפתור לשליחת הודעה בוואטסאפ או להתקשרות ישירה למוכר.'
  },
  {
    question: 'האם אפשר לערוך או למחוק פרסום?',
    answer: 'כרגע המערכת לא תומכת בעריכה עצמאית. ניתן לפנות אלינו דרך דף "צור קשר" ונסייע בכל בקשה.'
  },
  {
    question: 'איך אני יודע שהצעצוע איכותי?',
    answer: 'אנחנו ממליצים תמיד לפגוש את המוכר במקום ציבורי ולבדוק את הצעצוע לפני הרכישה. שימו לב למצב הצעצוע המפורט בפרסום.'
  },
  {
    question: 'לאילו גילאים מתאימים הצעצועים?',
    answer: 'הפלטפורמה מיועדת לצעצועים לילדים בגילאי 0-10. בכל פרסום מצוינת קטגוריית הצעצוע שיכולה לעזור להבין את הגיל המתאים.'
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">❓</span>
          <h1 className="text-3xl font-bold text-foreground mb-2">שאלות נפוצות</h1>
          <p className="text-muted-foreground">תשובות לשאלות הנפוצות ביותר</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-card p-6">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border last:border-0">
                <AccordionTrigger className="text-right hover:no-underline py-4">
                  <span className="font-medium text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
