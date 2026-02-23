import { Brain, Sparkles, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function Hero() {
  const { canInstall, installApp, isInstalled } = useInstallPrompt();

  const scrollToProblems = () => {
    const element = document.getElementById('problem-generator');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.92_0.04_40)] via-[oklch(0.95_0.02_140)] to-[oklch(0.98_0.01_80)]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[oklch(0.65_0.15_40)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[oklch(0.70_0.12_140)] rounded-full blur-3xl" />
      </div>
      
      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.98_0.01_80)] border border-[oklch(0.85_0.03_40)] text-sm font-medium text-[oklch(0.40_0.08_40)]">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Rajat's Equation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-[oklch(0.30_0.08_40)] leading-tight">
            Master JEE Mathematics
            <br />
            <span className="text-[oklch(0.55_0.12_40)]">Through Deep Thinking</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[oklch(0.45_0.05_40)] max-w-2xl mx-auto leading-relaxed">
            Excel in JEE Main and Advanced with thinking-based problem-solving. Build mathematical intuition across calculus, algebra, geometry, and more using Rajat's equation framework.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToProblems}
              className="text-lg px-8 py-6 bg-[oklch(0.55_0.15_40)] hover:bg-[oklch(0.50_0.15_40)] text-white shadow-lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start JEE Prep
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('progress')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-6 border-2 border-[oklch(0.55_0.12_40)] text-[oklch(0.45_0.10_40)] hover:bg-[oklch(0.95_0.02_40)]"
            >
              Track Progress
            </Button>
            {canInstall && !isInstalled && (
              <Button 
                size="lg" 
                onClick={installApp}
                className="text-lg px-8 py-6 bg-[oklch(0.70_0.12_140)] hover:bg-[oklch(0.65_0.12_140)] text-white shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          <img 
            src="/assets/generated/math-hero.dim_1200x600.png" 
            alt="JEE Mathematics preparation visualization"
            className="w-full rounded-2xl shadow-2xl border-4 border-white"
          />
        </div>
      </div>
    </header>
  );
}
