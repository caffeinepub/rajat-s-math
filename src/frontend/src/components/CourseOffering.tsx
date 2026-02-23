import { ShoppingCart, CheckCircle, LogIn, BookOpen, Award, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useGetCourseDetails, usePurchaseCourse, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';

export function CourseOffering() {
  const { data: course, isLoading: courseLoading } = useGetCourseDetails();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const purchaseCourse = usePurchaseCourse();

  const isAuthenticated = !!identity;
  const hasPurchased = userProfile?.hasPurchasedCourse || false;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase the course');
      return;
    }

    try {
      await purchaseCourse.mutateAsync();
      toast.success('🎉 Course purchased successfully! Welcome to the full JEE Math Mastery program!');
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error.message?.includes('already purchased')) {
        toast.error('You have already purchased this course');
      } else {
        toast.error('Failed to complete purchase. Please try again.');
      }
    }
  };

  if (courseLoading || (isAuthenticated && profileLoading)) {
    return (
      <section id="course-offering" className="scroll-mt-8 py-16 bg-gradient-to-br from-[oklch(0.96_0.02_40)] to-[oklch(0.98_0.01_140)]">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
        </div>
      </section>
    );
  }

  if (!course) return null;

  const benefits = [
    { icon: BookOpen, text: 'Comprehensive JEE Main & Advanced coverage' },
    { icon: Target, text: 'Topic-wise practice with instant feedback' },
    { icon: Award, text: 'Detailed progress tracking and analytics' },
    { icon: Sparkles, text: 'Step-by-step solutions for every problem' }
  ];

  return (
    <section id="course-offering" className="scroll-mt-8 py-16 bg-gradient-to-br from-[oklch(0.96_0.02_40)] to-[oklch(0.98_0.01_140)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[oklch(0.60_0.12_140)] text-white px-4 py-2 text-sm">
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.35_0.08_40)] mb-4">
            Master JEE Mathematics
          </h2>
          <p className="text-lg text-[oklch(0.50_0.05_40)] max-w-2xl mx-auto">
            Get unlimited access to our complete JEE preparation platform
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-2 border-[oklch(0.85_0.03_40)] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[oklch(0.55_0.15_40)] to-[oklch(0.60_0.12_140)] p-8 text-white">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-2">
                {course.title}
              </CardTitle>
              <CardDescription className="text-white/90 text-lg">
                {course.description}
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-[oklch(0.97_0.01_80)] border border-[oklch(0.90_0.02_40)]">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.55_0.15_40)] flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[oklch(0.40_0.08_40)] font-medium pt-2">
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[oklch(0.90_0.02_40)] pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm text-[oklch(0.55_0.05_40)] mb-2">Full Course Access</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[oklch(0.35_0.08_40)]">
                      ₹{Number(course.priceRupees).toLocaleString('en-IN')}
                    </span>
                    <span className="text-lg text-[oklch(0.55_0.05_40)]">one-time</span>
                  </div>
                  <p className="text-sm text-[oklch(0.60_0.12_140)] font-medium mt-2">
                    Lifetime access • No recurring fees
                  </p>
                </div>

                <div className="w-full md:w-auto">
                  {hasPurchased ? (
                    <div className="flex items-center gap-3 px-8 py-4 bg-[oklch(0.60_0.12_140)] text-white rounded-lg">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold text-lg">Course Purchased</span>
                    </div>
                  ) : isAuthenticated ? (
                    <Button
                      onClick={handlePurchase}
                      disabled={purchaseCourse.isPending}
                      size="lg"
                      className="w-full md:w-auto bg-[oklch(0.55_0.15_40)] hover:bg-[oklch(0.50_0.15_40)] text-white px-8 py-6 text-lg font-semibold"
                    >
                      {purchaseCourse.isPending ? (
                        'Processing...'
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Purchase Course
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => toast.info('Please login to purchase the course')}
                      size="lg"
                      variant="outline"
                      className="w-full md:w-auto border-2 border-[oklch(0.55_0.15_40)] text-[oklch(0.55_0.15_40)] hover:bg-[oklch(0.55_0.15_40)] hover:text-white px-8 py-6 text-lg font-semibold"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Login to Purchase
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="bg-[oklch(0.97_0.01_140)] border-l-4 border-[oklch(0.60_0.12_140)] p-4 rounded">
                <p className="text-sm text-[oklch(0.45_0.05_40)]">
                  <strong>Note:</strong> You need to login with Internet Identity to purchase and access the full course.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
