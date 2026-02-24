import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSetup() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        name: name.trim(),
        hasPurchasedCourse: false
      });
      toast.success('Welcome to Rajat\'s Math! 🎉');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.92_0.04_40)] via-[oklch(0.95_0.02_140)] to-[oklch(0.98_0.01_80)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-[oklch(0.85_0.03_40)] shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-[oklch(0.55_0.15_40)] flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-[oklch(0.35_0.08_40)] mb-2">
              Welcome to Rajat's Math!
            </CardTitle>
            <CardDescription className="text-base">
              Let's get you started with your JEE preparation journey
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[oklch(0.40_0.08_40)] font-medium">
                What should we call you?
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="border-2 border-[oklch(0.85_0.03_40)] focus:border-[oklch(0.55_0.15_40)] text-lg py-6"
                autoFocus
              />
            </div>
            
            <Button
              type="submit"
              disabled={saveProfile.isPending || !name.trim()}
              className="w-full bg-[oklch(0.55_0.15_40)] hover:bg-[oklch(0.50_0.15_40)] text-white text-lg py-6"
            >
              {saveProfile.isPending ? (
                'Setting up...'
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Learning
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
