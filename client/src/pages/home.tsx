
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type SearchParams } from "@shared/schema";
import SearchForm from "@/components/search-form";
import { MapPinned, Calendar, Clock, Plane, Globe, Compass, Hotel, Camera } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";

// SVG Background component
const WavyBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <svg
      className="absolute w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
    >
      <path
        fill="rgba(96, 165, 250, 0.1)"
        d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,165.3C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      />
    </svg>
    <svg
      className="absolute w-full h-full transform translate-y-1/2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
    >
      <path
        fill="rgba(147, 51, 234, 0.1)"
        d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,186.7C672,192,768,192,864,181.3C960,171,1056,149,1152,144C1248,139,1344,149,1392,154.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      />
    </svg>
  </div>
);

// Travel illustrations component
const TravelIllustrations = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
    <svg
      className="absolute top-20 left-10 w-32 h-32 text-primary/20 animate-float"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
    <svg
      className="absolute top-40 right-10 w-32 h-32 text-primary/20 animate-float-delayed"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  const generateMutation = useMutation({
    mutationFn: async (data: SearchParams) => {
      const res = await apiRequest("POST", "/api/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      navigate(`/itinerary/${data.shareId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate itinerary",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (searchParams: SearchParams) => {
    generateMutation.mutate(searchParams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50 relative">
      <WavyBackground />
      <TravelIllustrations />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trip on Buddy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Lets craft your perfect adventure with personalized itineraries, accommodation recommendations, and real-time availability.
            </p>
          </motion.div>

          {/* Search Form with Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-1"
          >
            <SearchForm
              onSearch={handleSearch}
              isLoading={generateMutation.isPending}
              disabled={generateMutation.isSuccess} // Pass the success state
            />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      {!user && ( // Conditionally render if user is not logged in
        <div className="py-24 bg-gradient-to-b from-blue-50 to-background relative">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
            >
              Plan Your Dream Trip
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Globe className="h-8 w-8" />}
                title="Smart Destinations"
                description="Discover hidden gems and popular spots tailored to your interests."
                delay={0}
              />
              <FeatureCard
                icon={<Hotel className="h-8 w-8" />}
                title="Real-time Availability"
                description="Get up-to-date accommodation options with instant booking."
                delay={0.2}
              />
              <FeatureCard
                icon={<Compass className="h-8 w-8" />}
                title="Optimized Routes"
                description="Make the most of your time with efficiently planned schedules."
                delay={0.4}
              />
              <FeatureCard
                icon={<Camera className="h-8 w-8" />}
                title="Local Experiences"
                description="Immerse yourself in authentic local activities and culture."
                delay={0.6}
              />
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      {!user && ( // Conditionally render if user is not logged in
        <div className="py-24 bg-gradient-to-b from-background to-blue-50 relative">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-center mb-16"
            >
              How It Works
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <StepCard
                number="1"
                title="Enter Your Destination"
                description="Tell us where you want to go and for how long."
                delay={0}
              />
              <StepCard
                number="2"
                title="Creates Your Plan"
                description="Our system generates a personalized itinerary just for you."
                delay={0.2}
              />
              <StepCard
                number="3"
                title="Start Your Adventure"
                description="Book your accommodations and activities instantly."
                delay={0.4}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(-20px); }
          50% { transform: translateY(0px); }
          100% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="p-6 rounded-xl backdrop-blur-lg bg-white/80 border border-primary/10 hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function StepCard({ 
  number, 
  title, 
  description, 
  delay 
}: { 
  number: string; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative p-8 rounded-xl backdrop-blur-lg bg-white/80 border border-primary/10 hover:border-primary/30 transition-all duration-300"
    >
      <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3 mt-4">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}