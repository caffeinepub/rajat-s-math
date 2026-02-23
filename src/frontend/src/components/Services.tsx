import { BookOpen, Target, Brain, TrendingUp, Award, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function Services() {
  const services = [
    {
      icon: Target,
      title: 'IOQM Prep',
      description: 'Comprehensive preparation for Indian Olympiad Qualifier in Mathematics with problem-solving strategies and practice.'
    },
    {
      icon: Award,
      title: 'NMTC Prep',
      description: 'National Mathematics Talent Contest preparation focusing on mathematical reasoning and competitive problem-solving.'
    },
    {
      icon: Brain,
      title: 'Thinking-Based Math for Any Standard',
      description: 'Develop deep mathematical thinking and intuition for students of all grades through conceptual understanding.'
    },
    {
      icon: TrendingUp,
      title: 'Mathematical Foundations Course',
      description: 'Build strong mathematical fundamentals with comprehensive coverage of core concepts and problem-solving techniques for all learners.'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Mathematics Program',
      description: 'Complete mathematics preparation covering all major topics with in-depth theory, practice, and real-world applications.'
    },
    {
      icon: Lightbulb,
      title: 'How to Think in Math',
      description: 'Specialized program for students facing difficulty in mathematics, building confidence and problem-solving mindset.'
    }
  ];

  return (
    <section id="services" className="scroll-mt-8 py-20 bg-gradient-to-br from-[oklch(0.98_0.01_80)] to-[oklch(0.96_0.02_140)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.20_0.05_240)] mb-4 font-serif">
            Our Programs
          </h2>
          <p className="text-lg md:text-xl text-[oklch(0.45_0.05_40)] max-w-2xl mx-auto">
            Comprehensive mathematics education tailored to your learning journey, from competitive exam preparation to foundational skill building
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="border-2 border-[oklch(0.85_0.03_40)] hover:border-[oklch(0.20_0.05_240)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white"
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[oklch(0.20_0.05_240)] to-[oklch(0.30_0.08_240)] flex items-center justify-center mb-4 shadow-md">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-[oklch(0.25_0.06_240)]">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[oklch(0.45_0.05_40)] leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
