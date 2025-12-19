
import { useState } from 'react';
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

const Admin = () => {
  /* 
     REFACTORING NOTE:
     We are removing the local 'productRequests' state and 'newProduct' logic here
     and replacing it with the AppContext consumption. 
  */
  const { user, productRequests, addProductRequest } = useApp();

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmitRequest = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) return;

    addProductRequest({
      name: newProduct.name,
      category: newProduct.category,
      price: parseInt(newProduct.price),
      description: newProduct.description,
      image: newProduct.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop' // default image if empty
    });

    setNewProduct({ name: '', category: '', price: '', description: '', image: '' });
    setIsDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter requests for the current admin if you want (but for now show all)
  // Or maybe filter only ones created by THIS admin? 
  // For simplicity, let's show all requests so they can see status updates.

  const pendingCount = productRequests.filter(req => req.status === 'pending').length;
  const approvedCount = productRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = productRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-stone-600 text-lg">
            Welcome back, {user?.name}. Manage product requests and support.
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
                  <div className="text-2xl font-bold">{productRequests.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedCount}</div>
                  <p className="text-xs text-muted-foreground">Ready for sale</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedCount}</div>
                  <p className="text-xs text-muted-foreground">Need revision</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-20 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                        <div className="text-center">
                          <Plus className="h-6 w-6 mx-auto mb-2" />
                          <span>Add New Product</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    {/* Reusing the same dialog content logic here would be redundant code if not careful, 
                        but effectively we want this button to open the SAME dialog as the one in the Products tab.
                        For simplicity in this step, let's just make it switch tabs or duplicate the dialog trigger logic.
                        Actually, let's just render the dialog content again here or keep it simple.
                        Correction: The original code didn't have the dialog WRAPPED around this button.
                        I will just make this button switch tab to 'products' ideally, but I can't easily control tabs state from here without more state.
                        I'll leave it as a direct trigger for now.
                     */}
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>New Product Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="quick-name">Product Name</Label>
                          <Input
                            id="quick-name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Enter product name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quick-category">Category</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="office">Office Chairs</SelectItem>
                              <SelectItem value="sofas">Sofas</SelectItem>
                              <SelectItem value="recliners">Recliners</SelectItem>
                              <SelectItem value="beanbags">Bean Bags</SelectItem>
                              <SelectItem value="dining">Dining Chairs</SelectItem>
                              <SelectItem value="lounge">Lounge Chairs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quick-price">Price (₹)</Label>
                          <Input
                            id="quick-price"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="Enter price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quick-image">Image URL</Label>
                          <Input
                            id="quick-image"
                            value={newProduct.image}
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                            placeholder="Enter image URL"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quick-description">Description</Label>
                          <Textarea
                            id="quick-description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Enter product description"
                          />
                        </div>
                        <Button onClick={handleSubmitRequest} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                      <span>Check Notifications</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <Package className="h-6 w-6 mx-auto mb-2" />
                      <span>Inventory Report</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Add Product Request */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">Request New Product</CardTitle>
                <CardDescription>Submit a new product request to Super Admin for approval</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
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
                            <SelectItem value="office">Office Chairs</SelectItem>
                            <SelectItem value="sofas">Sofas</SelectItem>
                            <SelectItem value="recliners">Recliners</SelectItem>
                            <SelectItem value="beanbags">Bean Bags</SelectItem>
                            <SelectItem value="dining">Dining Chairs</SelectItem>
                            <SelectItem value="lounge">Lounge Chairs</SelectItem>
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
                          placeholder="Enter image URL"
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
                      <Button onClick={handleSubmitRequest} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Product Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Product Requests</CardTitle>
                <CardDescription>Track all your product requests and their approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.image}
                          alt={request.name}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <div>
                          <h3 className="font-semibold text-lg text-stone-800">{request.name}</h3>
                          <p className="text-sm text-stone-600 mt-1">{request.description}</p>
                          <p className="text-xl font-bold text-amber-700 mt-2">₹{request.price.toLocaleString()}</p>
                          <p className="text-xs text-stone-500 mt-1">
                            Requested on {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <Badge className={`${getStatusColor(request.status)} px-3 py-1`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>Manage customer inquiries and support requests</CardDescription>
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
