import { Brain, Sparkles, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function Hero() {
  const { canInstall, installApp, isInstalled } = useInstallPrompt();

  const scrollToServices = () => {
    const element = document.getElementById('services');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEnrollment = () => {
    const element = document.getElementById('enrollment');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.92_0.04_40)] via-[oklch(0.95_0.02_140)] to-[oklch(0.98_0.01_80)]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[oklch(0.20_0.05_240)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[oklch(0.30_0.08_240)] rounded-full blur-3xl" />
      </div>
      
      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/generated/rajats-equation-logo.dim_250x200.png" 
              alt="Rajat's Equation Logo"
              className="w-32 h-auto md:w-52 md:h-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.98_0.01_80)] border border-[oklch(0.20_0.05_240)] text-sm font-medium text-[oklch(0.20_0.05_240)]">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Rajat's Equation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-[oklch(0.20_0.05_240)] leading-tight font-serif">
            Rajat's Equation
            <br />
            <span className="text-[oklch(0.30_0.08_240)] text-4xl md:text-5xl font-sans mt-2 block">Master Mathematical Thinking</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[oklch(0.45_0.05_40)] max-w-2xl mx-auto leading-relaxed">
            Transform your mathematical abilities with expert guidance. From IOQM and NMTC preparation to building strong foundations, we help students excel in mathematics through innovative teaching methods.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToEnrollment}
              className="text-lg px-8 py-6 bg-[oklch(0.20_0.05_240)] hover:bg-[oklch(0.25_0.06_240)] text-white shadow-lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              Enroll Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToServices}
              className="text-lg px-8 py-6 border-2 border-[oklch(0.20_0.05_240)] text-[oklch(0.20_0.05_240)] hover:bg-[oklch(0.20_0.05_240)] hover:text-white"
            >
              Explore Programs
            </Button>
            {canInstall && !isInstalled && (
              <Button 
                size="lg" 
                onClick={installApp}
                className="text-lg px-8 py-6 bg-[oklch(0.60_0.12_140)] hover:bg-[oklch(0.65_0.12_140)] text-white shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-16 max-w-5xl mx-auto">
          <img 
            src="/assets/generated/hero-banner.dim_1200x600.png" 
            alt="Mathematical excellence and innovative learning"
            className="w-full rounded-2xl shadow-2xl border-4 border-white"
          />
        </div>
      </div>
    </header>
  );
}
