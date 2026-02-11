import { useState, useEffect } from 'react';
import { Package, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, Truck, ShoppingBag, Calendar } from 'lucide-react';
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
import { collection, addDoc, updateDoc, doc, query, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

// --- Types ---
interface ProductRequest {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: any;
}

interface Order {
  id: string;
  amount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
  createdAt: any;
  shippingAddress?: {
    fullName: string;
    city: string;
  };
  userId: string;
}

const Admin = () => {
  const { user } = useApp();
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for New Product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: ''
  });

  // --- 1. Fetch Data (Real-Time) ---
  useEffect(() => {
    // A. Fetch Product Requests
    const qRequests = query(collection(db, 'product_requests'), orderBy('requestedAt', 'desc'));
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductRequest)));
    });

    // B. Fetch Orders (For Order Management Tab)
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });

    return () => {
      unsubscribeRequests();
      unsubscribeOrders();
    };
  }, []);

  // --- 2. Action: Submit New Product Request ---
  const handleSubmitRequest = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'product_requests'), {
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        description: newProduct.description,
        image: newProduct.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
        status: 'pending',
        adminName: user?.name || 'Manager',
        adminId: user?.uid,
        requestedAt: serverTimestamp()
      });

      toast.success("Product request submitted for approval");
      setNewProduct({ name: '', category: '', price: '', description: '', image: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. Action: Update Order Status ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order");
    }
  };

  // --- Helpers ---
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderBadgeColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const activeOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bright-red-700 to-bright-red-800 bg-clip-text text-transparent mb-2">
            Manager Dashboard
          </h1>
          <p className="text-stone-600 text-lg">
            Welcome back, {user?.name || 'Manager'}. Manage inventory and fulfill orders.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger> {/* NEW TAB */}
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: OVERVIEW --- */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{requests.length}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <Truck className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeOrdersCount}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {/* Calculate total revenue from orders */}
                  <div className="text-2xl font-bold">
                    ₹{orders.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- TAB 2: PRODUCTS --- */}
          <TabsContent value="products" className="space-y-6">
            {/* Add Product Request */}
            <Card className="bg-gradient-to-r from-bright-red-50 to-bright-red-50 border-bright-red-200">
              <CardHeader>
                <CardTitle className="text-bright-red-800">Request New Product</CardTitle>
                <CardDescription>Submit a new product request to Super Admin for approval</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-bright-red-600 to-bright-red-700 hover:from-bright-red-700 hover:to-bright-red-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Request New Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>New Product Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Office Chairs">Office Chairs</SelectItem>
                            <SelectItem value="Sofas">Sofas</SelectItem>
                            <SelectItem value="Recliners">Recliners</SelectItem>
                            <SelectItem value="Bean Bags">Bean Bags</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Enter product description"
                        />
                      </div>
                      <Button onClick={handleSubmitRequest} disabled={isLoading} className="w-full bg-gradient-to-r from-bright-red-600 to-bright-red-700">
                        <Send className="h-4 w-4 mr-2" />
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Product Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>Track the status of your submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.image}
                          alt={request.name}
                          className="w-16 h-16 object-cover rounded-lg border bg-stone-100"
                        />
                        <div>
                          <h3 className="font-semibold text-lg text-stone-800">{request.name}</h3>
                          <p className="text-sm text-stone-600">{request.category}</p>
                          <p className="text-sm font-bold text-bright-red-700">₹{request.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <Badge className={`${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-xs text-stone-400">
                          ID: {request.id.slice(0,8)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="text-center py-8 text-stone-500">
                      No requests found. Start by adding one!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 3: ORDER MANAGEMENT (NEW) --- */}
          <TabsContent value="orders">
             <Card>
                <CardHeader>
                    <CardTitle>Order Fulfillment</CardTitle>
                    <CardDescription>Manage and track customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-stone-500">
                            No orders received yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-stone-50 text-stone-600 font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-stone-50/50">
                                            <td className="px-4 py-3 font-mono text-xs text-stone-500">
                                                {order.id.slice(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3 text-stone-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {order.createdAt?.seconds 
                                                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() 
                                                        : 'Just now'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{order.shippingAddress?.fullName || 'Guest User'}</div>
                                                <div className="text-xs text-stone-400">{order.shippingAddress?.city}</div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-stone-800">
                                                ₹{order.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={getOrderBadgeColor(order.status)}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Select 
                                                    defaultValue={order.status} 
                                                    onValueChange={(val) => handleUpdateOrderStatus(order.id, val)}
                                                >
                                                    <SelectTrigger className="w-[130px] h-8 text-xs">
                                                        <SelectValue placeholder="Update" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="processing">Processing</SelectItem>
                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
             </Card>
          </TabsContent>

          {/* --- TAB 4: SUPPORT --- */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerSupport />
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