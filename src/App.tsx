import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; // <--- 1. IMPORT THIS

import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import NewArrivals from "./pages/NewArrivals";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";
import TrackOrder from "./pages/TrackOrder"; // <--- 2. IMPORT THIS
import OrderSuccess from "./pages/OrderSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <CartProvider>
          <WishlistProvider> {/* <--- 3. WRAP APP WITH WISHLIST PROVIDER */}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                {/* 4. ADD TRACK ORDER ROUTE */}
                <Route path="/track-order" element={<TrackOrder />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin']}>
                      <SuperAdmin />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider> {/* <--- CLOSE WISHLIST PROVIDER */}
        </CartProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;