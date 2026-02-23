import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'rajat-math'
  );

  return (
    <footer className="mt-20 border-t-2 border-[oklch(0.90_0.02_40)] bg-gradient-to-b from-[oklch(0.98_0.01_80)] to-[oklch(0.96_0.02_40)]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[oklch(0.35_0.08_40)]">
              Rajat's Math
            </h3>
            <p className="text-[oklch(0.50_0.05_40)]">
              Empowering creative mathematical thinking through Rajat's equation
            </p>
          </div>

          <div className="pt-6 border-t border-[oklch(0.88_0.03_40)]">
            <p className="text-sm text-[oklch(0.50_0.05_40)] flex items-center justify-center gap-2">
              © {currentYear} Rajat's Math. Built with{' '}
              <Heart className="w-4 h-4 fill-[oklch(0.55_0.15_40)] text-[oklch(0.55_0.15_40)]" />{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[oklch(0.45_0.10_40)] hover:text-[oklch(0.40_0.12_40)] underline underline-offset-4"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
