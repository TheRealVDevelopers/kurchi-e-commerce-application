import { useState, useEffect } from 'react';
import { Package, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

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

const Admin = () => {
  const { user } = useApp();
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: ''
  });

  // 1. Listen to Real-Time Requests from Firestore
  useEffect(() => {
    // Managers can see ALL requests to track status
    const q = query(collection(db, 'product_requests'), orderBy('requestedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProductRequest));
      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, []);

  // 2. Submit a New Request
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

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const rejectedCount = requests.filter(req => req.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-bright-red-700 to-bright-red-800 bg-clip-text text-transparent mb-2">
            Manager Dashboard
          </h1>
          <p className="text-stone-600 text-lg">
            Welcome back, {user?.name || 'Manager'}. Manage inventory and support.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="support">Customer Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
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
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedCount}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedCount}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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