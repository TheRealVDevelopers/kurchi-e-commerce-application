import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { validateGST } from '@/lib/utils';

const Login = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [gstNumber, setGstNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'superadmin') navigate('/super-admin');
            else navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (roleType: 'user' | 'business') => {
        if (roleType === 'business' && !validateGST(gstNumber)) {
            toast.error("Please enter a valid GST Number");
            return;
        }

        setIsLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document already exists
            const userDocRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                // If new user, create their profile with the selected role
                await setDoc(userDocRef, {
                    email: user.email,
                    name: user.displayName,
                    // If they chose business, set role to business, otherwise customer
                    role: roleType, 
                    gstNumber: roleType === 'business' ? gstNumber : null,
                    createdAt: serverTimestamp()
                });
                toast.success(`Welcome to Kuruchi ${roleType === 'business' ? 'Business' : ''}!`);
            } else {
                // If returning user, just welcome them back
                const userData = userSnapshot.data();
                toast.success(`Welcome back, ${userData.name}`);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Login Failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-bright-red-50 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-bright-red-600 to-bright-red-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-stone-800">
                            Welcome to Kuruchi
                        </CardTitle>
                        <CardDescription>
                            Sign in to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="customer" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="customer">Customer</TabsTrigger>
                                <TabsTrigger value="business">Business (B2B)</TabsTrigger>
                            </TabsList>

                            <TabsContent value="customer" className="space-y-4">
                                <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 mb-4">
                                    <div className="flex items-center gap-3 text-stone-600 mb-2">
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">Personal Account</span>
                                    </div>
                                    <p className="text-sm text-stone-500">
                                        Perfect for home furniture and personal orders.
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleLogin('user')} 
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg bg-stone-900 hover:bg-black"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                                </Button>
                            </TabsContent>

                            <TabsContent value="business" className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                    <div className="flex items-center gap-3 text-blue-700 mb-2">
                                        <Building2 className="h-5 w-5" />
                                        <span className="font-medium">Business Account</span>
                                    </div>
                                    <p className="text-sm text-blue-600">
                                        Enter your GSTIN to unlock bulk pricing and business invoices.
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="gst">GST Number</Label>
                                    <Input 
                                        id="gst" 
                                        placeholder="Ex: 22AAAAA0000A1Z5" 
                                        value={gstNumber}
                                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                        maxLength={15}
                                    />
                                </div>

                                <Button 
                                    onClick={() => handleLogin('business')}
                                    disabled={isLoading} 
                                    className="w-full h-12 text-lg bg-blue-700 hover:bg-blue-800"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify GST & Sign in'}
                                </Button>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6 text-center text-xs text-stone-400">
                            Protected by Kuruchi Secure Login
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;