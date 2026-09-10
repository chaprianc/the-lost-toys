import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { CheckCircle, Loader2, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface ManagedToy {
  id: string;
  toy_name: string;
  category: string;
  condition: string;
  price: number;
  city: string;
  images: string[];
  status: 'available' | 'sold' | 'hidden';
  created_at: string;
  updated_at: string;
}

type ManagementAction = 'get' | 'update_price' | 'mark_sold' | 'delete';

const invokeManagement = async (
  token: string,
  action: ManagementAction,
  price?: number,
): Promise<{ toy?: ManagedToy; deleted?: boolean }> => {
  const { data, error } = await supabase.functions.invoke('manage-toy', {
    body: { token, action, ...(price === undefined ? {} : { price }) },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

const statusDetails: Record<ManagedToy['status'], { label: string; className: string }> = {
  available: { label: 'המודעה פעילה', className: 'bg-success/15 text-success border-success/30' },
  sold: { label: 'סומן כנמכר', className: 'bg-muted text-muted-foreground' },
  hidden: { label: 'ממתין לאישור', className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const ManageToy = () => {
  const { token = '' } = useParams();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState('');
  const [deleted, setDeleted] = useState(false);

  const listingQuery = useQuery({
    queryKey: ['seller-management', token],
    queryFn: () => invokeManagement(token, 'get'),
    enabled: token.length === 64,
    retry: false,
  });

  const toy = listingQuery.data?.toy;

  useEffect(() => {
    if (toy) setPrice(String(toy.price));
  }, [toy]);

  const actionMutation = useMutation({
    mutationFn: ({ action, newPrice }: { action: ManagementAction; newPrice?: number }) =>
      invokeManagement(token, action, newPrice),
    onSuccess: (result, variables) => {
      if (result.deleted) {
        setDeleted(true);
        queryClient.removeQueries({ queryKey: ['seller-management', token] });
        toast.success('המודעה נמחקה');
        return;
      }
      queryClient.setQueryData(['seller-management', token], result);
      toast.success(variables.action === 'update_price' ? 'המחיר עודכן' : 'המודעה סומנה כנמכרה');
    },
    onError: () => toast.error('לא הצלחנו לעדכן את המודעה. נסו שוב.'),
  });

  const savePrice = () => {
    const nextPrice = Number(price);
    if (!Number.isFinite(nextPrice) || nextPrice < 1 || nextPrice > 50000) {
      toast.error('יש להזין מחיר תקין');
      return;
    }
    actionMutation.mutate({ action: 'update_price', newPrice: nextPrice });
  };

  if (deleted) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container mx-auto max-w-lg px-4 py-12">
          <Card className="border-0 text-center shadow-elevated">
            <CardContent className="py-10">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
              <h1 className="text-2xl font-bold">המודעה נמחקה</h1>
              <p className="mt-2 text-muted-foreground">הצעצוע לא יוצג עוד בחנות.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto max-w-lg px-4 py-8">
        <Card className="border-0 shadow-elevated">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">אזור פרטי למוכר</span>
            </div>
            <CardTitle className="text-2xl">ניהול המודעה</CardTitle>
            <p className="text-sm text-muted-foreground">
              כאן אפשר לעדכן מחיר, לסמן שהצעצוע נמכר או להסיר את המודעה.
            </p>
          </CardHeader>
          <CardContent>
            {listingQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                טוען את המודעה…
              </div>
            ) : listingQuery.isError || !toy ? (
              <div className="rounded-xl bg-destructive/10 p-5 text-center">
                <p className="font-semibold text-destructive">קישור הניהול אינו תקין או שהמודעה נמחקה</p>
                <p className="mt-1 text-sm text-muted-foreground">בדקו שהעתקתם את הקישור המלא.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-3">
                  {toy.images[0] && (
                    <img
                      src={toy.images[0]}
                      alt={toy.toy_name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-lg font-semibold">{toy.toy_name}</h1>
                    <p className="text-sm text-muted-foreground">{toy.city}</p>
                    <Badge variant="outline" className={`mt-2 ${statusDetails[toy.status].className}`}>
                      {statusDetails[toy.status].label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managed-price">מחיר חדש (₪)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="managed-price"
                      type="number"
                      min="1"
                      max="50000"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      disabled={actionMutation.isPending}
                    />
                    <Button
                      type="button"
                      onClick={savePrice}
                      disabled={actionMutation.isPending || Number(price) === toy.price}
                    >
                      {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                      שמירה
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    התשלום והמסירה עדיין נקבעים ישירות ביניכם לבין הקונה.
                  </p>
                </div>

                <div className="grid gap-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => actionMutation.mutate({ action: 'mark_sold' })}
                    disabled={actionMutation.isPending || toy.status === 'sold'}
                  >
                    <CheckCircle className="ml-2 h-5 w-5" />
                    {toy.status === 'sold' ? 'הצעצוע מסומן כנמכר' : 'סימון הצעצוע כנמכר'}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="outline" size="lg" className="text-destructive">
                        <Trash2 className="ml-2 h-5 w-5" />
                        מחיקת המודעה
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>למחוק את המודעה?</AlertDialogTitle>
                        <AlertDialogDescription>
                          הפעולה תמחק את “{toy.toy_name}” לצמיתות ולא ניתן יהיה להשתמש שוב בקישור הניהול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse gap-2">
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => actionMutation.mutate({ action: 'delete' })}
                        >
                          כן, למחוק
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManageToy;
