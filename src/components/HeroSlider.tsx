
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Premium Office Chairs",
      subtitle: "Ergonomic Design for Maximum Comfort",
      description: "Discover our collection of executive chairs designed for long hours of comfort and productivity.",
      image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&h=600&fit=crop&crop=center",
      cta: "Shop Chairs",
      price: "Starting from ₹15,999"
    },
    {
      id: 2,
      title: "Luxury Sofas",
      subtitle: "Transform Your Living Space",
      description: "Premium sofas crafted with finest materials for ultimate relaxation and style.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center",
      cta: "Explore Sofas",
      price: "Starting from ₹45,999"
    },
    {
      id: 3,
      title: "Comfort Recliners",
      subtitle: "Relax in Ultimate Luxury",
      description: "Experience the perfect blend of comfort and style with our premium recliner collection.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
      cta: "View Recliners",
      price: "Starting from ₹32,999"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[600px] overflow-hidden rounded-2xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative h-full">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center md:justify-start">
              <div className="text-center md:text-left px-8 md:px-16 text-white max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h2>
                <h3 className="text-xl md:text-2xl mb-6 text-amber-200">
                  {slide.subtitle}
                </h3>
                <p className="text-lg mb-8 opacity-90 leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start">
                  <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3">
                    {slide.cta}
                  </Button>
                  <div className="text-2xl font-bold text-amber-200">
                    {slide.price}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-amber-500 scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
