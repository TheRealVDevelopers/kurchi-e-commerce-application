import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
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

    useEffect(() => {
        if (user) {
            // Staff who somehow land here go to their dashboard
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
            const authUser = result.user;

            const userDocRef = doc(db, 'users', authUser.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                await setDoc(userDocRef, {
                    email: authUser.email,
                    name: authUser.displayName,
                    role: roleType,
                    status: 'active',
                    gstNumber: roleType === 'business' ? gstNumber : null,
                    createdAt: serverTimestamp()
                });
            }
            // Existing user — AppContext onAuthStateChanged handles redirect
        } catch (error: any) {
            toast.error("Login Failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream to-warm-50 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 bg-gradient-to-r from-warm-600 to-warm-700">
                            <User className="h-8 w-8 text-white" />
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
                                <Button
                                    onClick={() => handleLogin('user')}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg bg-warm-700 hover:bg-warm-800"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                                </Button>
                            </TabsContent>

                            <TabsContent value="business" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gst">GST Number</Label>
                                    <Input
                                        id="gst"
                                        placeholder="Ex: 22AAAAA0000A1Z5"
                                        value={gstNumber}
                                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <Button
                                    onClick={() => handleLogin('business')}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg bg-blue-700 hover:bg-blue-800"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Sign in'}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;