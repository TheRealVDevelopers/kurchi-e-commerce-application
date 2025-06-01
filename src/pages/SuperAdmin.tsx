
import { useState } from 'react';
import { Package, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const SuperAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      name: 'Ergonomic Office Chair',
      category: 'office',
      price: 25999,
      description: 'Premium ergonomic office chair with lumbar support',
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=200&fit=crop',
      adminName: 'John Admin',
      requestedAt: '2024-06-01T10:00:00Z'
    }
  ]);

  const salesData = [
    { month: 'Jan', sales: 1200000, orders: 45 },
    { month: 'Feb', sales: 1800000, orders: 67 },
    { month: 'Mar', sales: 2200000, orders: 89 },
    { month: 'Apr', sales: 1950000, orders: 72 },
    { month: 'May', sales: 2800000, orders: 98 },
    { month: 'Jun', sales: 3200000, orders: 112 }
  ];

  const productCategories = [
    { name: 'Office Chairs', value: 35, color: '#8B5CF6' },
    { name: 'Sofas', value: 25, color: '#06B6D4' },
    { name: 'Recliners', value: 20, color: '#F59E0B' },
    { name: 'Dining', value: 12, color: '#10B981' },
    { name: 'Others', value: 8, color: '#EF4444' }
  ];

  const topProducts = [
    { name: 'Executive Leather Chair', sales: 156, revenue: 2965000 },
    { name: 'Modern Sectional Sofa', sales: 89, revenue: 4981000 },
    { name: 'Ergonomic Desk Chair', sales: 124, revenue: 3224000 },
    { name: 'Luxury Recliner', sales: 67, revenue: 2211000 }
  ];

  const handleApproveRequest = (id: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleRejectRequest = (id: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Super Admin Dashboard</h1>
          <p className="text-stone-600">Monitor sales, manage products, and approve admin requests</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹32,45,000</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">483</div>
              <p className="text-xs text-muted-foreground">+15.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">+8.7% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Product Requests */}
        {pendingRequests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending Product Requests</CardTitle>
              <CardDescription>Review and approve/reject product requests from admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={request.image} 
                        alt={request.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-stone-800">{request.name}</h3>
                        <p className="text-sm text-stone-600">{request.description}</p>
                        <p className="text-lg font-bold text-amber-700">₹{request.price.toLocaleString()}</p>
                        <p className="text-xs text-stone-500">Requested by: {request.adminName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Product Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img src={request.image} alt={request.name} className="w-full h-48 object-cover rounded-lg" />
                            <div>
                              <h3 className="text-lg font-semibold">{request.name}</h3>
                              <p className="text-stone-600">{request.description}</p>
                              <p className="text-xl font-bold text-amber-700">₹{request.price.toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                onClick={() => handleRejectRequest(request.id)}
                                variant="destructive" 
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales</CardTitle>
              <CardDescription>Revenue and order trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#D97706" name="Sales (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
            <CardDescription>Number of orders over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#D97706" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best selling products by units and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold text-stone-800">{product.name}</h3>
                    <p className="text-sm text-stone-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₹{product.revenue.toLocaleString()}</p>
                    <Badge className="bg-green-100 text-green-800">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdmin;
