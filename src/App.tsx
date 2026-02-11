import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext"; // <--- Import this
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
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout"; // Adding this for the checkout flow
import OrderSuccess from "@/pages/OrderSuccess"; // Adding this for success page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <CartProvider> {/* <--- WRAP THE APP HERE */}
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
              
              {/* Checkout Routes */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />

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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider> {/* <--- CLOSE IT HERE */}
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;