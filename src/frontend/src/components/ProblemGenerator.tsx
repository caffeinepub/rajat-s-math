import { useState } from 'react';
import { Lightbulb, RefreshCw, CheckCircle2, Send, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useSaveSolution, useValidateAnswer, useGetAllProblems } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Topic } from '../backend';
import type { MathProblem } from '../backend';
import type { ValidationResult } from '../backend';

const TOPIC_LABELS: Record<Topic, string> = {
  [Topic.calculus]: 'Calculus',
  [Topic.algebra]: 'Algebra',
  [Topic.coordinateGeometry]: 'Coordinate Geometry',
  [Topic.trigonometry]: 'Trigonometry',
  [Topic.vectors]: 'Vectors',
  [Topic.probability]: 'Probability'
};

const DIFFICULTY_LABELS = {
  1: 'JEE Main - Easy',
  2: 'JEE Main - Challenging',
  3: 'JEE Advanced'
};

export function ProblemGenerator() {
  const { identity } = useInternetIdentity();
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [topic, setTopic] = useState<Topic>(Topic.calculus);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [solution, setSolution] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [steps, setSteps] = useState<string[]>(['']);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const { data: allProblems } = useGetAllProblems();
  const saveSolution = useSaveSolution();
  const validateAnswer = useValidateAnswer();

  const isAuthenticated = !!identity;

  const generateProblem = () => {
    if (!isAuthenticated) {
      toast.error('Please login to generate problems');
      return;
    }

    if (!allProblems || allProblems.length === 0) {
      toast.error('No problems available. Please contact admin.');
      return;
    }

    // Filter problems by difficulty and topic
    const filteredProblems = allProblems.filter(
      p => Number(p.difficulty) === difficulty && p.topic === topic
    );

    if (filteredProblems.length === 0) {
      toast.error(`No problems available for ${TOPIC_LABELS[topic]} at ${DIFFICULTY_LABELS[difficulty]} level`);
      return;
    }

    const problem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
    
    setCurrentProblem(problem);
    setSolution('');
    setStudentAnswer('');
    setSteps(['']);
    setStartTime(Date.now());
    setValidationResult(null);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleCheckAnswer = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit answers');
      return;
    }

    if (!currentProblem || !studentAnswer.trim()) {
      toast.error('Please enter your answer');
      return;
    }

    const answerNum = parseInt(studentAnswer, 10);
    if (isNaN(answerNum)) {
      toast.error('Please enter a valid number');
      return;
    }

    try {
      const result = await validateAnswer.mutateAsync({
        problemId: currentProblem.id,
        studentAnswer: BigInt(answerNum)
      });

      setValidationResult(result);

      if (result.isCorrect) {
        toast.success('Correct answer! 🎉');
      } else {
        toast.error('Incorrect. Try again!');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate answer. Please try again.');
    }
  };

  const handleRetry = () => {
    setStudentAnswer('');
    setValidationResult(null);
  };

  const submitSolution = () => {
    if (!currentProblem || steps.every(s => !s.trim())) {
      toast.error('Please add your solution steps');
      return;
    }

    if (!validationResult?.isCorrect) {
      toast.error('Please submit a correct answer before saving your solution');
      return;
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    saveSolution.mutate({
      problemId: currentProblem.id,
      solvedAt: Date.now(),
      steps: steps.filter(s => s.trim()),
      timeSpent,
      difficulty: Number(currentProblem.difficulty),
      topic: currentProblem.topic
    }, {
      onSuccess: () => {
        toast.success('Solution saved! Great thinking! 🎉');
        setCurrentProblem(null);
        setSolution('');
        setStudentAnswer('');
        setSteps(['']);
        setValidationResult(null);
      }
    });
  };

  return (
    <section id="problem-generator" className="scroll-mt-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.35_0.08_40)] mb-4">
          JEE Problem Practice
        </h2>
        <p className="text-lg text-[oklch(0.50_0.05_40)] max-w-2xl mx-auto">
          Select a topic and difficulty level to practice JEE-style problems that develop deep mathematical thinking.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-[oklch(0.85_0.03_40)] shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[oklch(0.96_0.02_40)] to-[oklch(0.96_0.02_140)]">
            <CardTitle className="flex items-center gap-2 text-[oklch(0.40_0.08_40)]">
              <Lightbulb className="w-6 h-6" />
              JEE Problem Generator
            </CardTitle>
            <CardDescription>Choose your topic and challenge level for JEE preparation</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {!isAuthenticated && (
              <Alert className="border-2 border-[oklch(0.85_0.03_40)] bg-[oklch(0.97_0.01_80)]">
                <Lock className="w-5 h-5" />
                <AlertTitle>Login Required</AlertTitle>
                <AlertDescription>
                  Please login to access JEE problem practice and track your progress.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-[oklch(0.45_0.05_40)] mb-2 block">
                  JEE Topic
                </label>
                <Select value={topic} onValueChange={(v) => setTopic(v as Topic)} disabled={!isAuthenticated}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Topic.calculus}>Calculus</SelectItem>
                    <SelectItem value={Topic.algebra}>Algebra</SelectItem>
                    <SelectItem value={Topic.coordinateGeometry}>Coordinate Geometry</SelectItem>
                    <SelectItem value={Topic.trigonometry}>Trigonometry</SelectItem>
                    <SelectItem value={Topic.vectors}>Vectors</SelectItem>
                    <SelectItem value={Topic.probability}>Probability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-[oklch(0.45_0.05_40)] mb-2 block">
                  Difficulty Level
                </label>
                <Select value={String(difficulty)} onValueChange={(v) => setDifficulty(Number(v) as 1 | 2 | 3)} disabled={!isAuthenticated}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">JEE Main - Easy</SelectItem>
                    <SelectItem value="2">JEE Main - Challenging</SelectItem>
                    <SelectItem value="3">JEE Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={generateProblem}
              disabled={!isAuthenticated}
              className="w-full bg-[oklch(0.60_0.12_140)] hover:bg-[oklch(0.55_0.12_140)] text-white disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Problem
            </Button>

            {currentProblem && isAuthenticated && (
              <div className="space-y-6 pt-4 border-t-2 border-[oklch(0.90_0.02_40)]">
                <div className="flex items-start gap-3 flex-wrap">
                  <Badge className="bg-[oklch(0.55_0.15_40)] text-white">
                    {DIFFICULTY_LABELS[Number(currentProblem.difficulty) as 1 | 2 | 3]}
                  </Badge>
                  <Badge variant="outline" className="border-[oklch(0.60_0.12_140)] text-[oklch(0.50_0.10_140)]">
                    {TOPIC_LABELS[currentProblem.topic]}
                  </Badge>
                </div>

                <div className="bg-[oklch(0.97_0.01_80)] p-6 rounded-xl border-2 border-[oklch(0.88_0.03_40)]">
                  <p className="text-lg leading-relaxed text-[oklch(0.35_0.06_40)]">
                    {currentProblem.question}
                  </p>
                </div>

                {/* Answer Submission Section */}
                <div className="space-y-4 bg-[oklch(0.98_0.01_140)] p-6 rounded-xl border-2 border-[oklch(0.88_0.03_140)]">
                  <h3 className="text-lg font-semibold text-[oklch(0.40_0.08_40)]">
                    Submit Your Answer
                  </h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-[oklch(0.50_0.05_40)] mb-2 block">
                        Your Answer (numeric value)
                      </label>
                      <Input
                        type="text"
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="border-2"
                        disabled={validationResult?.isCorrect}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleCheckAnswer}
                        disabled={validateAnswer.isPending || validationResult?.isCorrect}
                        className="bg-[oklch(0.60_0.12_140)] hover:bg-[oklch(0.55_0.12_140)] text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {validateAnswer.isPending ? 'Checking...' : 'Check Answer'}
                      </Button>
                    </div>
                  </div>

                  {/* Validation Result Display */}
                  {validationResult && (
                    <Alert variant={validationResult.isCorrect ? "default" : "destructive"} className="mt-4">
                      <AlertTitle className="flex items-center gap-2">
                        {validationResult.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Correct Answer!
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                          </>
                        )}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        {validationResult.feedback}
                        {!validationResult.isCorrect && (
                          <div className="mt-3">
                            <Button 
                              onClick={handleRetry}
                              variant="outline"
                              size="sm"
                              className="border-2"
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Solution Steps Section */}
                {validationResult?.isCorrect && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[oklch(0.40_0.08_40)]">
                        Your Solution Steps
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addStep}
                        className="border-[oklch(0.60_0.12_140)] text-[oklch(0.50_0.10_140)]"
                      >
                        Add Step
                      </Button>
                    </div>

                    {steps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium text-[oklch(0.50_0.05_40)]">
                          Step {index + 1}
                        </label>
                        <Textarea
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          placeholder="Describe your thinking process..."
                          className="min-h-24 border-2"
                        />
                      </div>
                    ))}

                    <Button 
                      onClick={submitSolution}
                      disabled={saveSolution.isPending}
                      className="w-full bg-[oklch(0.55_0.15_40)] hover:bg-[oklch(0.50_0.15_40)] text-white text-lg py-6"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {saveSolution.isPending ? 'Saving...' : 'Submit Solution'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!currentProblem && isAuthenticated && (
              <div className="text-center py-12">
                <img 
                  src="/assets/generated/thinking-icon.dim_128x128.png" 
                  alt="Start thinking"
                  className="w-32 h-32 mx-auto mb-4 opacity-50"
                />
                <p className="text-[oklch(0.50_0.05_40)] text-lg">
                  Select a topic and difficulty, then generate a JEE problem to begin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
