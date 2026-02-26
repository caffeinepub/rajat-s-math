import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitEnquiry } from '../hooks/useQueries';
import { CheckCircle, Loader2, ArrowLeft, GraduationCap, Copy, Check } from 'lucide-react';

const COURSE_OPTIONS = [
  'JEE Mathematics',
  'NEET Mathematics',
  'Class 11 Mathematics',
  'Class 12 Mathematics',
  'Calculus',
  'Algebra',
  'Trigonometry',
  'Coordinate Geometry',
  'Vectors & 3D',
  'Probability & Statistics',
  'Other',
];

interface StudentEnquiryFormProps {
  onBack?: () => void;
}

export default function StudentEnquiryForm({ onBack }: StudentEnquiryFormProps) {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [courseInterest, setCourseInterest] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submitEnquiry = useSubmitEnquiry();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';
    if (!courseInterest) newErrors.courseInterest = 'Please select a course interest';
    if (!message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const enquiryId = await submitEnquiry.mutateAsync({
        name: name.trim(),
        contactInfo: contactInfo.trim(),
        courseInterest,
        message: message.trim(),
      });
      setSubmittedId(enquiryId);
    } catch (err) {
      // error handled by mutation state
    }
  };

  const handleCopyId = () => {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submittedId) {
    return (
      <div className="min-h-screen bg-warm-light flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-border-warm shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-status-confirmed/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-status-confirmed" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-navy mb-2">Enquiry Submitted!</h2>
            <p className="text-warm-text mb-6">
              Thank you, <strong>{name}</strong>! Your enquiry has been received. Please save your Enquiry ID below — you'll need it to check your status.
            </p>

            <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 mb-6">
              <p className="text-xs text-warm-text mb-1 uppercase tracking-wide font-medium">Your Enquiry ID</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-navy font-mono font-bold text-lg">{submittedId}</code>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded hover:bg-navy/10 transition-colors"
                  title="Copy ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-status-confirmed" />
                  ) : (
                    <Copy className="w-4 h-4 text-navy/60" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-navy mb-1">What happens next?</p>
              <ul className="text-sm text-warm-text space-y-1 list-disc list-inside">
                <li>An admin will review your enquiry</li>
                <li>Once confirmed, you'll receive a QR code for check-in</li>
                <li>Use your Enquiry ID to check your status anytime</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={onBack}
                className="border-navy/30 text-navy hover:bg-navy/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  setSubmittedId(null);
                  setName('');
                  setContactInfo('');
                  setCourseInterest('');
                  setMessage('');
                }}
                className="bg-navy text-cream hover:bg-navy/90"
              >
                Submit Another Enquiry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-navy/70 hover:text-navy mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy">Student Enquiry Form</h1>
            <p className="text-warm-text text-sm">Fill in your details and we'll get back to you</p>
          </div>
        </div>

        <Card className="border-border-warm shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-navy font-serif text-lg">Your Information</CardTitle>
            <CardDescription>All fields are required. We'll review your enquiry and confirm it shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-navy font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`border-border-warm focus:border-navy ${errors.name ? 'border-red-400' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactInfo" className="text-navy font-medium">
                  Contact Information <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactInfo"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Phone number or email address"
                  className={`border-border-warm focus:border-navy ${errors.contactInfo ? 'border-red-400' : ''}`}
                />
                {errors.contactInfo && <p className="text-red-500 text-xs">{errors.contactInfo}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="courseInterest" className="text-navy font-medium">
                  Course Interest <span className="text-red-500">*</span>
                </Label>
                <Select value={courseInterest} onValueChange={setCourseInterest}>
                  <SelectTrigger
                    className={`border-border-warm focus:border-navy ${errors.courseInterest ? 'border-red-400' : ''}`}
                  >
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_OPTIONS.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseInterest && <p className="text-red-500 text-xs">{errors.courseInterest}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-navy font-medium">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your learning goals, current level, or any questions you have..."
                  rows={4}
                  className={`border-border-warm focus:border-navy resize-none ${errors.message ? 'border-red-400' : ''}`}
                />
                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
              </div>

              {submitEnquiry.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">
                    Failed to submit enquiry. Please try again.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitEnquiry.isPending}
                className="w-full bg-navy text-cream hover:bg-navy/90 font-semibold py-2.5"
              >
                {submitEnquiry.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Enquiry'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
