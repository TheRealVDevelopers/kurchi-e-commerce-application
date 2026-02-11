import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Save, Loader2, User } from 'lucide-react';

const AccountSettings = () => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '', // Phone isn't in default auth, so we store it in Firestore
    gstNumber: user?.gstNumber || ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        gstNumber: formData.gstNumber || null
        // Note: We don't update email here as that requires Re-Auth in Firebase
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your personal information and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
               {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : <User className="w-8 h-8" />}
            </div>
            <div>
                <p className="text-sm font-medium text-stone-500">Profile Picture</p>
                <p className="text-xs text-stone-400">Managed via your Google Account</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user?.email || ''} disabled className="bg-stone-50 text-stone-500 cursor-not-allowed" />
            <p className="text-xs text-stone-400">Contact support to change email.</p>
          </div>

          {/* Conditional: Business Only Field */}
          {user?.role === 'business' && (
            <div className="space-y-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <Label className="text-blue-900">GST Number (Business)</Label>
                <Input 
                    value={formData.gstNumber} 
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} 
                    className="bg-white border-blue-200"
                    placeholder="Enter GST Number"
                />
                <p className="text-xs text-blue-600">Required for B2B Invoice generation.</p>
            </div>
          )}

          <Button type="submit" className="bg-stone-900" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;