import { useState } from 'react';
import { Header } from '@/components/Header';
import { useToyStore } from '@/store/toyStore';
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
import { Trash2, Eye, ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ADMIN_PASSWORD = 'admin123';

const Admin = () => {
  const { toys, updateToyStatus, deleteToy } = useToyStore();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('סיסמה שגויה');
    }
  };

  const handleStatusChange = (id: string, status: 'available' | 'sold' | 'hidden') => {
    updateToyStatus(id, status);
    toast.success('הסטטוס עודכן בהצלחה');
  };

  const handleDelete = (id: string) => {
    deleteToy(id);
    toast.success('הצעצוע נמחק בהצלחה');
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
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזן סיסמת מנהל"
                    className="text-center"
                  />
                </div>
                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}
                <Button type="submit" className="w-full">
                  כניסה
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ניהול פלטפורמה</h1>
            <p className="text-muted-foreground text-sm">{toys.length} צעצועים במערכת</p>
          </div>
        </div>

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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/toy/${toy.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
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
      </main>
    </div>
  );
};

export default Admin;
