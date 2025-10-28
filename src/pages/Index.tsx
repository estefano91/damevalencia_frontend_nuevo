import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, TrendingUp, Globe, Award, Sparkles, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Dynamic Profiles",
      description: "Showcase your talent with customizable profiles for players, coaches, clubs, agents, sponsors, and investors.",
    },
    {
      icon: TrendingUp,
      title: "Aura Score",
      description: "Build your reputation with a dynamic score based on engagement, verified activity, and peer endorsements.",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with sports professionals worldwide and discover opportunities across all major sports.",
    },
    {
      icon: Award,
      title: "Verified Badges",
      description: "Get verified to stand out and build trust with premium badges for elite professionals.",
    },
    {
      icon: Sparkles,
      title: "Smart Matching",
      description: "AI-powered recommendations to connect with the right people at the right time.",
    },
    {
      icon: Zap,
      title: "Instant Connections",
      description: "Quick connect features to network efficiently and build meaningful relationships fast.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-aura-gradient opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        <nav className="relative z-10 border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-white">Aura</h1>
              <div className="space-x-4">
                <Button variant="ghost" onClick={() => navigate("/auth")} className="text-white hover:bg-white/10">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-white text-primary hover:bg-white/90">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              The LinkedIn of Sports
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Connect clubs, players, coaches, agents, sponsors, and investors worldwide.
              Build your Aura. Own your career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              >
                Join Aura
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aura provides the tools and network to advance your sports career
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 rounded-lg border bg-card hover:shadow-aura-lg transition-all duration-smooth hover:-translate-y-1"
                >
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-aura-gradient">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-aura-gradient-radial">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Build Your Aura?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of sports professionals already networking on Aura
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
