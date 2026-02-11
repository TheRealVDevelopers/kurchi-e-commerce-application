import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Home, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

const AddressBook = () => {
  const { user } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  // 1. Fetch Addresses Real-time
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'addresses'), orderBy('label'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address)));
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Add Address
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      await addDoc(collection(db, 'users', user.uid, 'addresses'), formData);
      toast.success("Address added successfully");
      setIsOpen(false);
      // Reset form (keep name)
      setFormData({ ...formData, street: '', city: '', state: '', zipCode: '', phone: '' });
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Delete Address
  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      toast.success("Address removed");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Addresses</CardTitle>
          <CardDescription>Manage your shipping addresses for faster checkout.</CardDescription>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-stone-900 hover:bg-stone-800">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} placeholder="e.g. Home, Office" />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} placeholder="Flat / House No / Floor, Building" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-stone-900" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-12 text-stone-500 border-2 border-dashed rounded-xl">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No addresses saved yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((addr) => (
              <div key={addr.id} className="relative p-4 border rounded-xl hover:border-stone-400 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    {addr.label.toLowerCase() === 'work' ? <Building className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    {addr.label}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-stone-600 space-y-1">
                  <p className="font-medium text-stone-800">{addr.fullName}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                  <p className="text-stone-400 mt-2">📞 {addr.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressBook;