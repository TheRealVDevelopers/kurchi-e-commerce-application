import { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Star, Award, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useApp, UserRole } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

const SuperAdmin = () => {
  const { user } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Pending Requests
  useEffect(() => {
    const q = query(collection(db, 'product_requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(pendingData);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch All Users (For User Management Tab)
  useEffect(() => {
    // We order by role so Admins/Business users show up first
    const q = query(collection(db, 'users'), orderBy('role'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Approve Logic
  const handleApprove = async (request: any) => {
    try {
      // Add to REAL Products
      await addDoc(collection(db, 'products'), {
        name: request.name,
        category: request.category,
        price: request.price,
        description: request.description,
        image: request.image,
        rating: 0,
        reviews: 0,
        badge: 'New Arrival',
        createdAt: new Date()
      });

      // Mark Request as Approved
      const requestRef = doc(db, 'product_requests', request.id);
      await updateDoc(requestRef, { status: 'approved' });
      toast.success(`${request.name} is now LIVE!`);
    } catch (error) {
      console.error(error);
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const requestRef = doc(db, 'product_requests', id);
      await updateDoc(requestRef, { status: 'rejected' });
      toast.info("Request rejected");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // 4. Role Update Logic
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-tomato-50 to-tomato-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-tomato-700 via-tomato-600 to-red-600 bg-clip-text text-transparent mb-2">
            Super Admin HQ
          </h1>
          <p className="text-stone-600 text-lg">
            Manage approvals and user permissions.
          </p>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="requests" className="relative">
                Requests 
                {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                        {requests.length}
                    </span>
                )}
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: PRODUCT REQUESTS --- */}
          <TabsContent value="requests" className="space-y-6">
            {requests.length > 0 ? (
              <Card className="border-bright-red-200 bg-gradient-to-r from-bright-red-50 to-bright-red-50">
                <CardHeader>
                  <CardTitle className="text-bright-red-800">Pending Approvals</CardTitle>
                  <CardDescription>Review these items before they go live on the customer site.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-stone-100">
                        <img src={request.image} alt={request.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-bold text-stone-900">{request.name}</h3>
                          <div className="flex gap-2 text-sm text-stone-500 mt-1">
                             <Badge variant="outline">{request.category}</Badge>
                             <span>By: {request.adminName || 'Unknown'}</span>
                          </div>
                          <p className="text-xl font-bold text-bright-red-700 mt-2">₹{request.price.toLocaleString()}</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader><DialogTitle>Approval Request</DialogTitle></DialogHeader>
                              <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <img src={request.image} alt={request.name} className="w-full h-64 object-cover rounded-xl" />
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-2xl font-bold">{request.name}</h3>
                                    <p className="text-bright-red-600 font-medium">{request.category}</p>
                                  </div>
                                  <p className="text-stone-600">{request.description}</p>
                                  <div className="flex gap-3 pt-4">
                                    <Button onClick={() => handleApprove(request)} className="flex-1 bg-green-600 hover:bg-green-700">Approve</Button>
                                    <Button onClick={() => handleReject(request.id)} className="flex-1 bg-red-600 hover:bg-red-700">Reject</Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="text-center py-20 text-stone-500">No pending requests.</CardContent></Card>
            )}
          </TabsContent>

          {/* --- TAB 2: USER MANAGEMENT (NEW!) --- */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Roles & Permissions</CardTitle>
                <CardDescription>Promote users to Admins (Managers) or Business Accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                  <div className="space-y-4">
                    {allUsers.map((u) => (
                      <div key={u.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-stone-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600">
                             {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">{u.name || 'Unknown User'}</p>
                            <p className="text-sm text-stone-500">{u.email}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs text-stone-400">UID: {u.uid.slice(0,6)}...</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Role Badge */}
                            <Badge className={
                                u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                                u.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                                u.role === 'business' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }>
                                {u.role.toUpperCase()}
                            </Badge>

                            {/* Role Dropdown */}
                            {u.role !== 'superadmin' && ( // Don't let superadmin demote themselves accidentally
                                <Select 
                                    onValueChange={(val) => handleRoleChange(u.uid, val as UserRole)}
                                    defaultValue={u.role}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Change Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Customer</SelectItem>
                                        <SelectItem value="business">Business (B2B)</SelectItem>
                                        <SelectItem value="admin">Manager</SelectItem>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="overview">
              <div className="p-4 text-center text-stone-500">Overview Stats Placeholder</div>
           </TabsContent>

        </Tabs>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default SuperAdmin;