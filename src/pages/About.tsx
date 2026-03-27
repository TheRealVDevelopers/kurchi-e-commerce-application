import { Heart, ShoppingCart, Award, Users, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';

const About = () => {
  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Handcrafted furniture with finest materials and attention to detail'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Skilled craftsmen with years of experience in furniture making'
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Complimentary delivery and setup for all orders above ₹15,000'
    },
    {
      icon: Shield,
      title: 'Warranty',
      description: '2-year comprehensive warranty on all furniture pieces'
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-stone-900 mb-6">About Kurchi</h1>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            We are passionate about creating premium furniture that combines timeless design with modern comfort.
            Every piece is crafted with care to transform your space into a haven of style and functionality.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Story</h2>
            <p className="text-lg text-stone-600 mb-6">
              Founded in 2020, Kurchi began as a small family business with a simple vision: to make premium
              furniture accessible to everyone. What started as a passion project has grown into a trusted
              brand known for quality, craftsmanship, and exceptional customer service.
            </p>
            <p className="text-lg text-stone-600 mb-6">
              Our name "Kurchi" comes from the Hindi word for chair, reflecting our roots and commitment
              to creating seating solutions that bring comfort and joy to Indian homes and offices.
            </p>
            <Button size="lg" className="bg-warm-700 hover:bg-warm-800 text-white">
              Explore Our Collection
            </Button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&crop=center"
              alt="Our Workshop"
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">Why Choose Kurchi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-warm-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-stone-900 mb-3">{feature.title}</h3>
                  <p className="text-stone-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-stone-900 mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Kumar', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
              { name: 'Priya Sharma', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face' },
              { name: 'Amit Singh', role: 'Production Manager', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' }
            ].map((member, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-semibold text-lg text-stone-900">{member.name}</h3>
                  <p className="text-stone-600">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-warm-700 to-warm-800 text-white rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-xl mb-8">Get in touch with us for personalized furniture solutions</p>
          <Button size="lg" className="bg-white text-warm-700 hover:bg-stone-100 font-bold">
            Contact Us
          </Button>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default About;
