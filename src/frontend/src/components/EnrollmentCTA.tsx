import { CheckCircle2, Award, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function EnrollmentCTA() {
  const handleEnrollClick = () => {
    const upiUrl = 'upi://pay?pa=9424135055@ptyes&pn=Rajat%27s%20Equation';
    window.location.href = upiUrl;
  };

  const benefits = [
    {
      icon: Award,
      title: 'Expert Instruction',
      description: 'Learn from experienced educators dedicated to mathematical excellence'
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Track record of success in competitive exams and academic achievement'
    },
    {
      icon: CheckCircle2,
      title: 'Comprehensive Curriculum',
      description: 'Complete coverage of all mathematical topics with depth and clarity'
    },
    {
      icon: Users,
      title: 'Personalized Approach',
      description: 'Individual attention and customized learning paths for every student'
    }
  ];

  return (
    <section id="enrollment" className="scroll-mt-8 py-20 bg-gradient-to-br from-[oklch(0.96_0.02_140)] via-[oklch(0.98_0.01_80)] to-[oklch(0.95_0.03_40)]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.20_0.05_240)] text-white text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>Transform Your Mathematical Journey</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.20_0.05_240)] mb-6 font-serif">
              Join Rajat's Equation Today
            </h2>
            <p className="text-lg md:text-xl text-[oklch(0.45_0.05_40)] max-w-3xl mx-auto leading-relaxed">
              Give your child the gift of mathematical excellence. Our proven teaching methods have helped hundreds of students achieve their academic goals and develop a genuine love for mathematics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 border-[oklch(0.85_0.03_40)] bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[oklch(0.20_0.05_240)] to-[oklch(0.30_0.08_240)] flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[oklch(0.25_0.06_240)] mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-[oklch(0.45_0.05_40)] leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[oklch(0.20_0.05_240)] to-[oklch(0.30_0.08_240)] rounded-2xl p-8 md:p-12 text-center shadow-2xl">
            <div className="flex justify-center mb-6">
              <img 
                src="/assets/generated/trust-badge.dim_128x128.png" 
                alt="Trusted by students and parents"
                className="w-20 h-20 object-contain"
              />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
              Ready to Excel in Mathematics?
            </h3>
            <p className="text-lg md:text-xl text-[oklch(0.95_0.02_240)] mb-8 max-w-2xl mx-auto">
              Enroll now and start your journey towards mathematical mastery. Secure your spot in our comprehensive program designed for success.
            </p>
            <Button 
              size="lg"
              onClick={handleEnrollClick}
              className="text-lg px-10 py-7 bg-white text-[oklch(0.20_0.05_240)] hover:bg-[oklch(0.98_0.01_80)] shadow-xl font-bold"
            >
              Enroll Now via UPI
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-[oklch(0.90_0.02_240)] mt-6">
              Secure payment via UPI • Instant confirmation • Start learning immediately
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[oklch(0.45_0.05_40)] mb-4">
              Have questions? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/919424135055"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.45_0.15_145)] hover:bg-[oklch(0.40_0.15_145)] text-white rounded-lg transition-colors font-medium shadow-md"
              >
                Chat on WhatsApp
              </a>
              <a
                href="https://www.youtube.com/channel/UCR9lkyJ3JIhlSx3_e06DTEw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.50_0.20_25)] hover:bg-[oklch(0.45_0.20_25)] text-white rounded-lg transition-colors font-medium shadow-md"
              >
                Watch Our Videos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
