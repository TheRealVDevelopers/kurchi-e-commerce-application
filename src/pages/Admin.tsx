import { useState, useEffect } from 'react';
import { 
  Plus, Clock, CheckCircle, XCircle, Truck, ShoppingBag, 
  Printer, ArrowUpRight, MessageSquare, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import CustomerSupport from '@/components/CustomerSupport';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, query, onSnapshot, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { toast } from 'sonner';

interface Order {
  id: string;
  amount: number;
  status: string;
  items: any[];
  createdAt: any;
  shippingAddress?: any;
}

interface Product {
    id: string;
    name: string;
    stock: number;
    price: number;
    image: string;
    sku: string;
}

const Admin = () => {
  const { user } = useApp();
  
  // Data State
  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Stats
  const [stats, setStats] = useState({ todaySales: 0, pendingOrders: 0, toShip: 0, lowStockCount: 0 });

  // UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stockUpdateId, setStockUpdateId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState('');

  // --- NEW: ADVANCED PRODUCT FORM STATE ---
  const [newProduct, setNewProduct] = useState({
    name: '', 
    category: '', 
    description: '', 
    image: '',
    sku: '',            // NEW
    stock: '',          // NEW
    gst: '',            // NEW
    price: '',          // B2C Price
    b2bPrice: '',       // NEW: B2B Price
  });

  // --- 1. DATA ENGINE ---
  useEffect(() => {
    // A. Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      calculateDailyStats(ordersData);
      
      // Activity Feed
      const feed = ordersData.slice(0, 5).map(o => ({
          type: 'order', id: o.id, title: `New Order: ₹${o.amount}`,
          desc: o.shippingAddress?.fullName || 'Guest', time: o.createdAt
      }));
      setRecentActivity(feed);
    });

    // B. Products (Low Stock Check)
    const qProducts = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
        const prodData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(prodData);
        setStats(prev => ({ ...prev, lowStockCount: prodData.filter(p => (p.stock || 0) < 5).length }));
    });

    // C. My Requests
    if (user?.uid) {
        const qRequests = query(collection(db, 'product_requests'), where('adminId', '==', user.uid));
        const unsubRequests = onSnapshot(qRequests, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => { unsubOrders(); unsubProducts(); unsubRequests(); };
    }
    return () => { unsubOrders(); unsubProducts(); };
  }, [user]);

  // --- 2. LOGIC & ACTIONS ---
  const calculateDailyStats = (ordersData: Order[]) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayOrders = ordersData.filter(o => o.createdAt?.seconds && new Date(o.createdAt.seconds * 1000) >= today);
      
      setStats(prev => ({
          ...prev,
          todaySales: todayOrders.reduce((sum, o) => sum + o.amount, 0),
          pendingOrders: ordersData.filter(o => o.status === 'processing').length,
          toShip: ordersData.filter(o => o.status === 'processing').length
      }));
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
      await updateDoc(doc(db, 'orders', id), { status });
      toast.success(`Order marked as ${status}`);
  };

  const handleUpdateStock = async () => {
      if (!stockUpdateId || !newStockValue) return;
      await updateDoc(doc(db, 'products', stockUpdateId), { stock: parseInt(newStockValue) });
      toast.success("Stock updated");
      setStockUpdateId(null);
  };

  const handleSubmitRequest = async () => {
    // Validation
    if (!newProduct.name || !newProduct.price || !newProduct.sku) {
        toast.error("Name, Price, and SKU are required");
        return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'product_requests'), {
        ...newProduct,
        price: Number(newProduct.price),
        b2bPrice: Number(newProduct.b2bPrice) || Number(newProduct.price), // Fallback to B2C if empty
        stock: Number(newProduct.stock) || 0,
        gst: Number(newProduct.gst) || 18,
        status: 'pending',
        adminName: user?.name,
        adminId: user?.uid,
        requestedAt: serverTimestamp()
      });
      toast.success("Request submitted to HQ");
      setIsDialogOpen(false);
      setNewProduct({ name: '', category: '', price: '', b2bPrice: '', description: '', image: '', sku: '', stock: '', gst: '' });
    } catch (e) { toast.error("Submission failed"); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Operations Center</h1>
                <p className="text-stone-500">Manage orders, stock, and new products.</p>
            </div>
            <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-stone-900"><Plus className="w-4 h-4 mr-2"/> New Product</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Product Creation Wizard</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            {/* Basic Info */}
                            <div className="col-span-2"><Label>Product Name</Label><Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Ergonomic Office Chair" /></div>
                            
                            <div><Label>Category</Label>
                                <Select onValueChange={v => setNewProduct({...newProduct, category: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Office Chairs">Office Chairs</SelectItem>
                                        <SelectItem value="Sofas">Sofas</SelectItem>
                                        <SelectItem value="Recliners">Recliners</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>SKU (Stock Keeping Unit)</Label><Input value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. CHR-BLK-001" /></div>
                            
                            {/* Pricing & Stock */}
                            <div className="p-4 bg-stone-50 rounded-lg col-span-2 grid grid-cols-2 gap-4 border">
                                <div><Label>B2C Price (Retail)</Label><Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="₹" /></div>
                                <div><Label>B2B Price (Wholesale)</Label><Input type="number" value={newProduct.b2bPrice} onChange={e => setNewProduct({...newProduct, b2bPrice: e.target.value})} placeholder="₹" className="border-blue-200" /></div>
                                <div><Label>GST %</Label><Input type="number" value={newProduct.gst} onChange={e => setNewProduct({...newProduct, gst: e.target.value})} placeholder="18" /></div>
                                <div><Label>Initial Stock</Label><Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="Qty" /></div>
                            </div>

                            <div className="col-span-2"><Label>Image URL</Label><Input value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://..." /></div>
                            <div className="col-span-2"><Label>Description</Label><Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} /></div>
                            
                            <Button onClick={handleSubmitRequest} disabled={isLoading} className="col-span-2 bg-stone-900 h-12 text-lg">
                                {isLoading ? 'Submitting...' : 'Submit to HQ for Approval'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          {/* TAB 1: Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-green-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-stone-500">Today's Sales</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{stats.todaySales.toLocaleString()}</div></CardContent></Card>
                <Card className="border-l-4 border-l-blue-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-stone-500">Pending Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pendingOrders}</div></CardContent></Card>
                <Card className="border-l-4 border-l-red-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-stone-500">Low Stock Items</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.lowStockCount}</div></CardContent></Card>
                <Card className="border-l-4 border-l-orange-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-stone-500">To Ship</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.toShip}</div></CardContent></Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5"/> Live Activity</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center justify-between pb-3 border-b last:border-0">
                                    <div><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-stone-500">{item.desc}</p></div>
                                    <span className="text-xs text-stone-400">{item.time?.seconds ? new Date(item.time.seconds*1000).toLocaleTimeString() : 'Now'}</span>
                                </div>
                            ))}
                            {recentActivity.length===0 && <p className="text-stone-400">No recent activity.</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline" onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2"/> New Product</Button>
                        <Button className="w-full justify-start" variant="outline"><MessageSquare className="w-4 h-4 mr-2"/> Check Support</Button>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* TAB 2: Orders */}
          <TabsContent value="orders">
             <Card>
                <CardHeader><CardTitle>Order Fulfillment</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-stone-50 border-b">
                                <tr>
                                    <th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 font-mono">{order.id.slice(0,8)}</td>
                                        <td className="px-4 py-3">{order.shippingAddress?.fullName}</td>
                                        <td className="px-4 py-3 font-bold">₹{order.amount}</td>
                                        <td className="px-4 py-3">
                                            <Select defaultValue={order.status} onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}>
                                                <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="processing">Processing</SelectItem>
                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-4 py-3"><Button size="sm" variant="ghost"><Printer className="w-4 h-4"/></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>

          {/* TAB 3: Inventory */}
          <TabsContent value="inventory">
            <Card>
                <CardHeader><CardTitle>Stock Control</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {products.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 border rounded">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={p.image} className="w-12 h-12 rounded object-cover" />
                                        {(p.stock||0) < 5 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
                                    </div>
                                    <div><p className="font-medium">{p.name}</p><p className="text-xs text-stone-500">SKU: {p.sku || 'N/A'}</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {stockUpdateId === p.id ? (
                                        <>
                                            <Input className="w-20 h-8" type="number" value={newStockValue} onChange={e => setNewStockValue(e.target.value)} />
                                            <Button size="sm" className="h-8 bg-green-600" onClick={handleUpdateStock}>Save</Button>
                                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setStockUpdateId(null)}><XCircle className="w-4 h-4"/></Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => { setStockUpdateId(p.id); setNewStockValue(String(p.stock||0)); }}>
                                            Stock: {p.stock || 0}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support"><CustomerSupport /></TabsContent>

          <TabsContent value="requests">
            <Card>
                <CardHeader><CardTitle>My Requests</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.id} className="flex justify-between p-3 border rounded">
                                <span className="font-medium">{req.name}</span>
                                <Badge variant={req.status==='approved'?'secondary':'outline'}>{req.status.toUpperCase()}</Badge>
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

export default Admin;