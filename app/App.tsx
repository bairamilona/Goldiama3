import React, { useState, useEffect } from "react";
import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/Hero";
import { CartProvider } from "@/app/contexts/CartContext";
import { CurrencyProvider } from "@/app/contexts/CurrencyContext";
import { ModalProvider, useModal } from "@/app/contexts/ModalContext";
import { ShoppingCart } from "@/app/components/ShoppingCart";
import { LazySection } from "@/app/components/LazySection";
import { initPerformanceMonitoring } from "@/lib/performance-monitor";
import { logoImage } from "@/assets"; // ✅ ИСПРАВЛЕНО: Импорт из @/assets
import "@/styles/fonts.css";
import "@/styles/theme.css";

// ✅ STATIC IMPORTS: Заменяем все lazy на обычные импорты
import TickerPanel from "@/app/components/TickerPanel";
import { Heritage } from "@/app/components/Heritage";
import { ProductSection } from "@/app/components/ProductSection";
import { WholesaleBanner } from "@/app/components/WholesaleBanner";
import Footer from "@/app/components/Footer";
import { ProductSectionWholesale } from "@/app/components/ProductSectionWholesale";
import { CompareBlock } from "@/app/components/CompareBlock";
import { ContactSection } from "@/app/components/ContactSection";

// ✅ Внутренний компонент для доступа к useModal
function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [isLoading, setIsLoading] = useState(true);
  const { isModalOpen } = useModal();

  // Suppress Three.js multiple instances warning globally
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('Multiple instances of Three.js') || 
          message.includes('scroll offset is calculated correctly')) {
        return;
      }
      originalWarn(...args);
    };
    
    // ✅ Suppress known Spline errors
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // Spline buffer deserialization error - known issue with некоторые версии сцен
      if (message.includes('Data read, but end of buffer not reached') ||
          message.includes('Spline Error') ||
          args[0]?.message?.includes('Data read, but end of buffer not reached')) {
        // Логируем в warning вместо error для debug
        if (process.env.NODE_ENV === 'development') {
          console.warn('%c[Spline] Scene loading issue (non-critical):', 'color: #F59E0B;', message);
        }
        return;
      }
      originalError(...args);
    };
    
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  // 📊 PERFORMANCE MONITORING: Initialize Core Web Vitals tracking
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  useEffect(() => {
    // Preloader duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Preloader UI - now inside providers */}
      {isLoading ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          {/* Animated Logo */}
          <div className="relative">
            <img 
              src={logoImage}
              alt="GOLDIAMA"
              className="w-32 h-32 object-contain animate-pulse"
              style={{
                filter: 'brightness(1.2) contrast(1.1)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* ===== FIXED ELEMENTS (Outside main content flow) ===== */}
          
          {/* Navbar - Fixed top */}
          <Navbar 
            onNavigate={setCurrentPage} 
            isVisible={true} 
          />
          
          {/* Ticker Panel - Fixed below navbar */}
          <TickerPanel />
          
          {/* Shopping Cart Sidebar - Fixed right */}
          <ShoppingCart />
          
          {/* Hero - Fixed, parallax container (уезжает вверх при скролле) */}
          {/* ✅ Передаём isPaused чтобы заморозить анимации когда открыта модалка */}
          <Hero isPaused={isModalOpen} />
          
          
          {/* ===== MAIN CONTENT (Scrollable) ===== */}
          <main className="relative w-full min-h-screen bg-white">
            
            {/* Spacer for Hero parallax - 100vh занимает место Hero */}
            <div className="h-[100vh] w-full" aria-hidden="true" />
            
            {/* Content Container - все секции в правильном порядке */}
            <div className="relative w-full">
              
              {/* Heritage Section */}
              <LazySection animationDelay={200}>
                <Heritage />
              </LazySection>
              
              {/* Product Section (Retail) */}
              <LazySection animationDelay={400}>
                <ProductSection />
              </LazySection>
              
              {/* Wholesale Block - bg-[#FAFAF8] */}
              <div className="relative w-full bg-[#FAFAF8] py-12 md:py-16 lg:py-20">
                <LazySection animationDelay={600}>
                  <WholesaleBanner />
                </LazySection>
                
                <div className="mt-8 md:mt-12">
                  <LazySection animationDelay={800}>
                    <ProductSectionWholesale />
                  </LazySection>
                </div>
              </div>
              
              {/* Compare Block */}
              <LazySection animationDelay={1000}>
                <CompareBlock />
              </LazySection>
              
              {/* Contact Section */}
              <LazySection animationDelay={1200}>
                <ContactSection />
              </LazySection>
              
              {/* Footer */}
              <LazySection animationDelay={1400}>
                <Footer />
              </LazySection>
              
            </div>
          </main>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <CurrencyProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </CurrencyProvider>
    </CartProvider>
  );
}