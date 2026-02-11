import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';

// Define what a Product looks like (including the new gallery)
export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  description: string;
  category: string;
  image: string;     // The main cover image
  gallery?: string[]; // The extra photos (optional)
}

interface ProductModalContextType {
  openProduct: (product: Product) => void;
  closeProduct: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export const ProductModalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeProduct = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedProduct(null), 300); // Wait for animation
  };

  return (
    <ProductModalContext.Provider value={{ openProduct, closeProduct }}>
      {children}
      {/* The Modal itself lives here, at the top level of your app */}
      <ProductDetailsModal 
        product={selectedProduct} 
        isOpen={isOpen} 
        onClose={closeProduct} 
      />
    </ProductModalContext.Provider>
  );
};

export const useProductModal = () => {
  const context = useContext(ProductModalContext);
  if (context === undefined) {
    throw new Error('useProductModal must be used within a ProductModalProvider');
  }
  return context;
};