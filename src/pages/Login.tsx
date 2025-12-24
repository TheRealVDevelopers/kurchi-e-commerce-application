
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, UserCog, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

const Login = () => {
    const { login, user } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            if (user.role === 'superadmin') navigate('/super-admin');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-bright-red-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-bright-red-500 to-bright-red-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-stone-500 text-base">
                                Secure access for authorized personnel
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Button
                                onClick={() => login('admin')}
                                className="w-full h-14 text-lg font-medium bg-white hover:bg-stone-50 text-stone-700 border-2 border-stone-200 hover:border-bright-red-500 transition-all duration-300 group shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center w-full">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mr-4 group-hover:bg-bright-red-100 transition-colors">
                                        <UserCog className="h-5 w-5 text-stone-600 group-hover:text-bright-red-600" />
                                    </div>
                                    <span className="flex-1 text-left">Login as Admin</span>
                                    <Lock className="h-4 w-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Button>

                            <Button
                                onClick={() => login('superadmin')}
                                className="w-full h-14 text-lg font-medium bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white border-0 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
                            >
                                <div className="flex items-center w-full">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                                        <UserCheck className="h-5 w-5 text-bright-red-400" />
                                    </div>
                                    <span className="flex-1 text-left">Login as Super Admin</span>
                                    <Shield className="h-4 w-4 text-bright-red-400" />
                                </div>
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-stone-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-stone-400">
                                    Protected System
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
