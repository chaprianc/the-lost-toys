import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAllToys, useUpdateToyStatus, useDeleteToy } from '@/hooks/useToys';
import { useBlockedPhones, useBlockPhone, useUnblockPhone } from '@/hooks/useBlockedPhones';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/toy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Eye, ShieldCheck, Lock, Loader2, CheckCircle, Clock, AlertTriangle, LogOut, Ban, UserX, Plus, Settings, Mail, KeyRound, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { data: toys = [], isLoading } = useAllToys();
  const { data: blockedPhones = [], isLoading: isLoadingBlocked } = useBlockedPhones();
  const blockPhone = useBlockPhone();
  const unblockPhone = useUnblockPhone();
  const updateStatus = useUpdateToyStatus();
  const deleteToy = useDeleteToy();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [newBlockPhone, setNewBlockPhone] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  
  // Settings state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin-password', {
        body: { password },
      });

      if (fnError) {
        setError('שגיאה באימות. נסה שוב.');
        return;
      }

      if (data?.success) {
        setIsAuthenticated(true);
        // Store session in sessionStorage (cleared when browser closes)
        sessionStorage.setItem('adminAuthenticated', 'true');
      } else {
        setError('סיסמה שגויה');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('שגיאה באימות. נסה שוב.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Check session on mount
  useState(() => {
    const stored = sessionStorage.getItem('adminAuthenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  });

  const handleStatusChange = (id: string, status: 'available' | 'sold' | 'hidden') => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success('הסטטוס עודכן בהצלחה'),
      onError: () => toast.error('שגיאה בעדכון הסטטוס'),
    });
  };

  const handleDelete = (id: string) => {
    deleteToy.mutate(id, {
      onSuccess: () => toast.success('הצעצוע נמחק בהצלחה'),
      onError: () => toast.error('שגיאה במחיקת הצעצוע'),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-2xl shadow-card p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">כניסת מנהל</h1>
                <p className="text-muted-foreground text-sm mt-1">הזן סיסמה כדי להמשיך</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4" aria-label="טופס כניסת מנהל">
                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזן סיסמת מנהל"
                    className="text-center"
                    aria-required="true"
                    aria-describedby={error ? "password_error" : undefined}
                    aria-invalid={error ? "true" : "false"}
                  />
                </div>
                {error && (
                  <p id="password_error" className="text-destructive text-sm text-center" role="alert" aria-live="assertive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isVerifying} aria-busy={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                      <span>מאמת...</span>
                    </>
                  ) : (
                    'כניסה'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const pendingToys = toys.filter(t => t.status === 'hidden');
  const approvedToys = toys.filter(t => t.status !== 'hidden');

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: 'available' }, {
      onSuccess: () => toast.success('הצעצוע אושר ופורסם!'),
      onError: () => toast.error('שגיאה באישור הצעצוע'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ניהול פלטפורמה</h1>
              <p className="text-muted-foreground text-sm">
                {pendingToys.length > 0 && (
                  <span className="text-warning font-medium">{pendingToys.length} ממתינים לאישור • </span>
                )}
                {toys.length} צעצועים במערכת
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.removeItem('adminAuthenticated');
              setIsAuthenticated(false);
              setPassword('');
              toast.success('התנתקת בהצלחה');
            }}
            className="flex items-center gap-2"
            aria-label="התנתקות מממשק הניהול"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            התנתק
          </Button>
        </div>

        {/* Alert banner for pending toys */}
        {!isLoading && pendingToys.length > 0 && (
          <div className="bg-warning/20 border border-warning/30 rounded-xl p-4 mb-6 flex items-center gap-3 animate-pulse" role="alert" aria-live="polite">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {pendingToys.length} צעצועים ממתינים לאישור תשלום
              </p>
              <p className="text-sm text-muted-foreground">
                יש לאשר את התשלום בביט/פייבוקס לפני פרסום
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">טוען...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                ממתינים לאישור
                {pendingToys.length > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    {pendingToys.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                כל הצעצועים
              </TabsTrigger>
              <TabsTrigger value="blocked" className="flex items-center gap-2">
                <Ban className="w-4 h-4" />
                חסומים
                {blockedPhones.length > 0 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    {blockedPhones.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                הגדרות
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingToys.length === 0 ? (
                <div className="bg-card rounded-2xl shadow-card p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">אין צעצועים ממתינים</h3>
                  <p className="text-muted-foreground text-sm">כל הפרסומים אושרו</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">תמונה</TableHead>
                          <TableHead className="text-right">שם</TableHead>
                          <TableHead className="text-right">מחיר</TableHead>
                          <TableHead className="text-right">טלפון</TableHead>
                          <TableHead className="text-right">עיר</TableHead>
                          <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingToys.map((toy) => (
                          <TableRow key={toy.id} className="bg-warning/5">
                            <TableCell>
                              <img
                                src={toy.images[0]}
                                alt={toy.toy_name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{toy.toy_name}</TableCell>
                            <TableCell>₪{toy.price}</TableCell>
                            <TableCell dir="ltr" className="text-right">{toy.seller_phone}</TableCell>
                            <TableCell>{toy.city}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2" role="group" aria-label={`פעולות עבור ${toy.toy_name}`}>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(toy.id)}
                                  className="bg-success hover:bg-success/90"
                                  aria-label={`אשר תשלום עבור ${toy.toy_name}`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                                  אשר תשלום
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/toy/${toy.id}`)}
                                  aria-label={`צפה בפרטי ${toy.toy_name}`}
                                >
                                  <Eye className="w-4 h-4" aria-hidden="true" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`מחק את ${toy.toy_name}`}>
                                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>למחוק את הצעצוע?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        פעולה זו תמחק את "{toy.toy_name}" לצמיתות.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-row-reverse gap-2">
                                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(toy.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        מחק
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all">
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">תמונה</TableHead>
                        <TableHead className="text-right">שם</TableHead>
                        <TableHead className="text-right">קטגוריה</TableHead>
                        <TableHead className="text-right">מחיר</TableHead>
                        <TableHead className="text-right">עיר</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {toys.map((toy) => (
                        <TableRow key={toy.id}>
                          <TableCell>
                            <img
                              src={toy.images[0]}
                              alt={toy.toy_name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{toy.toy_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{CATEGORY_LABELS[toy.category]}</Badge>
                          </TableCell>
                          <TableCell>₪{toy.price}</TableCell>
                          <TableCell>{toy.city}</TableCell>
                          <TableCell>
                            <Select
                              value={toy.status}
                              onValueChange={(v) => handleStatusChange(toy.id, v as 'available' | 'sold' | 'hidden')}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-success" />
                                    {STATUS_LABELS.available}
                                  </span>
                                </SelectItem>
                                <SelectItem value="sold">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                                    {STATUS_LABELS.sold}
                                  </span>
                                </SelectItem>
                                <SelectItem value="hidden">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-destructive" />
                                    {STATUS_LABELS.hidden}
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2" role="group" aria-label={`פעולות עבור ${toy.toy_name}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/toy/${toy.id}`)}
                                aria-label={`צפה בפרטי ${toy.toy_name}`}
                              >
                                <Eye className="w-4 h-4" aria-hidden="true" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`מחק את ${toy.toy_name}`}>
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>למחוק את הצעצוע?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      פעולה זו תמחק את "{toy.toy_name}" לצמיתות. לא ניתן לבטל פעולה זו.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-row-reverse gap-2">
                                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(toy.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      מחק
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blocked">
              <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  חסום מספר טלפון
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="block-phone">מספר טלפון</Label>
                    <Input
                      id="block-phone"
                      type="tel"
                      value={newBlockPhone}
                      onChange={(e) => setNewBlockPhone(e.target.value)}
                      placeholder="05X-XXXXXXX"
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="block-reason">סיבה (אופציונלי)</Label>
                    <Input
                      id="block-reason"
                      type="text"
                      value={newBlockReason}
                      onChange={(e) => setNewBlockReason(e.target.value)}
                      placeholder="סיבת החסימה"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        if (!newBlockPhone.trim()) {
                          toast.error('יש להזין מספר טלפון');
                          return;
                        }
                        blockPhone.mutate(
                          { phone: newBlockPhone.trim(), reason: newBlockReason.trim() || undefined },
                          {
                            onSuccess: () => {
                              toast.success('המספר נחסם בהצלחה');
                              setNewBlockPhone('');
                              setNewBlockReason('');
                            },
                            onError: (err: any) => {
                              if (err.code === '23505') {
                                toast.error('מספר זה כבר חסום');
                              } else {
                                toast.error('שגיאה בחסימת המספר');
                              }
                            },
                          }
                        );
                      }}
                      disabled={blockPhone.isPending}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {blockPhone.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          חסום
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {isLoadingBlocked ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : blockedPhones.length === 0 ? (
                <div className="bg-card rounded-2xl shadow-card p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">אין מספרים חסומים</h3>
                  <p className="text-muted-foreground text-sm">הפלטפורמה פתוחה לכולם</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">מספר טלפון</TableHead>
                          <TableHead className="text-right">סיבה</TableHead>
                          <TableHead className="text-right">תאריך חסימה</TableHead>
                          <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blockedPhones.map((blocked) => (
                          <TableRow key={blocked.id}>
                            <TableCell dir="ltr" className="text-right font-mono">
                              {blocked.phone}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {blocked.reason || '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(blocked.blocked_at).toLocaleDateString('he-IL')}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-success hover:text-success"
                                  >
                                    <UserX className="w-4 h-4 mr-1" />
                                    בטל חסימה
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>לבטל חסימה?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      המספר {blocked.phone} יוכל שוב לפרסם מודעות בפלטפורמה.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-row-reverse gap-2">
                                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        unblockPhone.mutate(blocked.id, {
                                          onSuccess: () => toast.success('החסימה בוטלה'),
                                          onError: () => toast.error('שגיאה בביטול החסימה'),
                                        });
                                      }}
                                    >
                                      בטל חסימה
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Change Admin Email */}
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    שנה מייל מנהל
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    מייל זה ישמש לקבלת התראות על צעצועים חדשים
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="admin-email">כתובת מייל חדשה</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                        dir="ltr"
                        className="text-left"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={async () => {
                          if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
                            toast.error('יש להזין כתובת מייל תקינה');
                            return;
                          }
                          setIsSavingSettings(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('update-admin-settings', {
                              body: { type: 'email', value: newAdminEmail.trim() },
                            });
                            if (error) throw error;
                            toast.success('מייל המנהל עודכן בהצלחה');
                            setNewAdminEmail('');
                          } catch (err) {
                            console.error('Error updating email:', err);
                            toast.error('שגיאה בעדכון המייל');
                          } finally {
                            setIsSavingSettings(false);
                          }
                        }}
                        disabled={isSavingSettings || !newAdminEmail.trim()}
                      >
                        {isSavingSettings ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            שמור
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Change Admin Password */}
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    שנה סיסמת מנהל
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    סיסמה זו תשמש לכניסה לממשק הניהול
                  </p>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="new-password">סיסמה חדשה</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="הזן סיסמה חדשה"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="confirm-password">אימות סיסמה</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="הזן שוב את הסיסמה"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={async () => {
                          if (!newAdminPassword.trim()) {
                            toast.error('יש להזין סיסמה חדשה');
                            return;
                          }
                          if (newAdminPassword.length < 6) {
                            toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
                            return;
                          }
                          if (newAdminPassword !== confirmPassword) {
                            toast.error('הסיסמאות לא תואמות');
                            return;
                          }
                          setIsSavingSettings(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('update-admin-settings', {
                              body: { type: 'password', value: newAdminPassword },
                            });
                            if (error) throw error;
                            toast.success('סיסמת המנהל עודכנה בהצלחה');
                            setNewAdminPassword('');
                            setConfirmPassword('');
                          } catch (err) {
                            console.error('Error updating password:', err);
                            toast.error('שגיאה בעדכון הסיסמה');
                          } finally {
                            setIsSavingSettings(false);
                          }
                        }}
                        disabled={isSavingSettings || !newAdminPassword.trim() || !confirmPassword.trim()}
                      >
                        {isSavingSettings ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            עדכן סיסמה
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    שים לב
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>שינוי הסיסמה יכנס לתוקף מיידית</li>
                    <li>לאחר שינוי סיסמה תצטרך להתחבר מחדש</li>
                    <li>ודא שאתה זוכר את הסיסמה החדשה</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Admin;
