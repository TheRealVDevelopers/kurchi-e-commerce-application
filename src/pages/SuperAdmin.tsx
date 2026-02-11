import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Add Link import
import { 
  Package, TrendingUp, Users, DollarSign, CheckCircle, XCircle, 
  Star, Award, Loader2, Shield, Trash2, Tag, Percent, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useApp, UserRole } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

const SuperAdmin = () => {
  const { user } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [offerPrice, setOfferPrice] = useState('');

  // 1. Fetch Pending Requests
  useEffect(() => {
    const q = query(collection(db, 'product_requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch All Users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('role'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 3. Fetch Live Inventory
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleApprove = async (request: any) => {
    try {
      await addDoc(collection(db, 'products'), {
        name: request.name,
        category: request.category,
        price: request.price,
        description: request.description,
        image: request.image,
        featured: false,
        salePrice: null,
        createdAt: new Date()
      });
      await updateDoc(doc(db, 'product_requests', request.id), { status: 'approved' });
      toast.success(`${request.name} is now LIVE!`);
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    await updateDoc(doc(db, 'product_requests', id), { status: 'rejected' });
    toast.info("Request rejected");
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product forever?")) {
        await deleteDoc(doc(db, 'products', id));
        toast.error("Product deleted");
    }
  };

  const handleToggleFeature = async (product: any) => {
    const newVal = !product.featured;
    await updateDoc(doc(db, 'products', product.id), { featured: newVal });
    toast.success(newVal ? "Product Featured!" : "Removed from Featured");
  };

  const handleSetOffer = async () => {
    if (!selectedProduct) return;
    const price = Number(offerPrice);
    if (isNaN(price)) return;
    try {
        await updateDoc(doc(db, 'products', selectedProduct.id), { 
            salePrice: price > 0 ? price : null 
        });
        toast.success(price > 0 ? "Special Offer Live!" : "Offer Removed");
        setSelectedProduct(null);
        setOfferPrice('');
    } catch (e) {
        toast.error("Failed to set offer");
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    toast.success(`User role updated to ${newRole}`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* --- HEADER WITH LINK TO MANAGER VIEW --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-stone-900 mb-2">HQ Dashboard</h1>
            <p className="text-stone-600">Complete control over inventory, users, and offers.</p>
          </div>
          
          <Link to="/admin">
            <Button variant="outline" className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-sm">
              <Shield className="w-4 h-4 mr-2" />
              Switch to Manager View
            </Button>
          </Link>
        </div>

        {/* --- QUICK ACTION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-stone-900 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-bright-red-500" />
                Operational Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-400 text-sm mb-4">Jump to the manager dashboard to handle fulfillment and customer support.</p>
              <Link to="/admin?tab=orders">
                <Button className="w-full bg-white text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-2">
                  Manage Orders <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-500 text-sm font-medium">Global Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-stone-900">{allUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-500 text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-bright-red-600">{requests.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] bg-white border border-stone-200 shadow-sm">
            <TabsTrigger value="inventory">Live Inventory</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
                Requests 
                {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white animate-pulse">
                        {requests.length}
                    </span>
                )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Live Products</CardTitle>
                    <CardDescription>Feature items, set discounts, or remove them.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                      <div className="space-y-4">
                          {inventory.map((item) => (
                              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                      <div className="relative">
                                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                          {item.featured && <div className="absolute -top-2 -left-2 bg-yellow-400 text-white p-1 rounded-full"><Star className="w-3 h-3 fill-current" /></div>}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-stone-900">{item.name}</h3>
                                          <div className="flex items-center gap-2">
                                              {item.salePrice ? (
                                                  <>
                                                      <span className="text-stone-400 line-through text-sm">₹{item.price}</span>
                                                      <span className="text-green-600 font-bold">₹{item.salePrice}</span>
                                                      <Badge variant="outline" className="text-green-600 border-green-200 text-[10px]">OFFER</Badge>
                                                  </>
                                              ) : (
                                                  <span className="text-stone-600">₹{item.price}</span>
                                              )}
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                      <Button 
                                          variant="outline" size="sm"
                                          onClick={() => handleToggleFeature(item)}
                                          className={item.featured ? "bg-yellow-50 border-yellow-200 text-yellow-700" : ""}
                                      >
                                          <Star className={`w-4 h-4 ${item.featured ? "fill-current" : ""}`} />
                                      </Button>

                                      <Dialog>
                                          <DialogTrigger asChild>
                                              <Button variant="outline" size="sm" className={item.salePrice ? "bg-green-50 border-green-200 text-green-700" : ""}>
                                                  <Percent className="w-4 h-4" />
                                              </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                              <DialogHeader><DialogTitle>Set Special Offer</DialogTitle></DialogHeader>
                                              <div className="py-4 space-y-4">
                                                  <Label>Original Price: ₹{item.price}</Label>
                                                  <div className="space-y-2">
                                                      <Label>New Offer Price (₹)</Label>
                                                      <Input 
                                                          type="number" 
                                                          defaultValue={item.salePrice || ''} 
                                                          onChange={(e) => setOfferPrice(e.target.value)} 
                                                      />
                                                      <p className="text-xs text-stone-500">Set to 0 to remove the offer.</p>
                                                  </div>
                                              </div>
                                              <DialogFooter>
                                                  <Button onClick={() => { setSelectedProduct(item); handleSetOffer(); }}>Save Offer</Button>
                                              </DialogFooter>
                                          </DialogContent>
                                      </Dialog>

                                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(item.id)}>
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
             <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? <p className="text-center py-10 text-stone-500">All caught up!</p> : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="flex justify-between items-center p-4 border rounded-lg bg-white">
                                    <div className="flex gap-4">
                                        <img src={request.image} className="w-16 h-16 rounded object-cover" />
                                        <div>
                                            <p className="font-bold">{request.name}</p>
                                            <p className="text-sm text-stone-500">₹{request.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleApprove(request)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleReject(request.id)} className="text-red-600 hover:bg-red-50">Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>User Roles</CardTitle></CardHeader>
              <CardContent>
                  <div className="space-y-2">
                    {allUsers.map((u) => (
                      <div key={u.uid} className="flex items-center justify-between p-3 border rounded hover:bg-stone-50">
                        <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-stone-500">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{u.role}</Badge>
                            {u.role !== 'superadmin' && (
                                <Select onValueChange={(val) => handleRoleChange(u.uid, val as UserRole)}>
                                    <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="admin">Manager</SelectItem>
                                        <SelectItem value="superadmin">HQ</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default SuperAdmin;