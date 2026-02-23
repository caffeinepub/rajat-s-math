import { TrendingUp, Award, Target, BookOpen, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useProgress, useGetProgressByTopic, useGetCallerUserProfile } from '../hooks/useQueries';
import { Skeleton } from './ui/skeleton';
import { Topic } from '../backend';

const TOPIC_LABELS: Record<Topic, string> = {
  [Topic.calculus]: 'Calculus',
  [Topic.algebra]: 'Algebra',
  [Topic.coordinateGeometry]: 'Coordinate Geometry',
  [Topic.trigonometry]: 'Trigonometry',
  [Topic.vectors]: 'Vectors',
  [Topic.probability]: 'Probability'
};

const TOPIC_COLORS: Record<Topic, string> = {
  [Topic.calculus]: 'oklch(0.55_0.15_40)',
  [Topic.algebra]: 'oklch(0.60_0.12_140)',
  [Topic.coordinateGeometry]: 'oklch(0.65_0.10_200)',
  [Topic.trigonometry]: 'oklch(0.58_0.13_80)',
  [Topic.vectors]: 'oklch(0.62_0.11_280)',
  [Topic.probability]: 'oklch(0.56_0.14_320)'
};

export function ProgressTracker() {
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: topicProgress, isLoading: topicLoading } = useGetProgressByTopic();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  if (progressLoading || topicLoading || profileLoading) {
    return (
      <section id="progress" className="scroll-mt-8">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </section>
    );
  }

  if (!progress) return null;

  const totalProblems = progress.totalSolved;
  const hasPurchasedCourse = userProfile?.hasPurchasedCourse || false;

  return (
    <section id="progress" className="scroll-mt-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[oklch(0.35_0.08_40)] mb-4">
          Your JEE Progress
        </h2>
        <p className="text-lg text-[oklch(0.50_0.05_40)] max-w-2xl mx-auto">
          Track your performance across JEE topics and identify areas for improvement.
        </p>
      </div>

      {hasPurchasedCourse && (
        <Card className="max-w-6xl mx-auto mb-8 border-2 border-[oklch(0.60_0.12_140)] bg-gradient-to-r from-[oklch(0.98_0.01_140)] to-[oklch(0.98_0.01_40)]">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.60_0.12_140)] flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[oklch(0.35_0.08_40)] mb-1">
                  Full Course Access Activated
                </h3>
                <p className="text-[oklch(0.50_0.05_40)]">
                  You have unlimited access to all JEE Math Mastery features
                </p>
              </div>
              <Badge className="bg-[oklch(0.60_0.12_140)] text-white px-4 py-2 text-sm">
                Premium Member
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-[oklch(0.85_0.03_40)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-[oklch(0.55_0.15_40)]" />
              <span className="text-3xl font-bold text-[oklch(0.40_0.08_40)]">
                {totalProblems}
              </span>
            </div>
            <p className="text-sm text-[oklch(0.50_0.05_40)]">Problems Solved</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[oklch(0.85_0.03_140)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-[oklch(0.60_0.12_140)]" />
              <span className="text-3xl font-bold text-[oklch(0.40_0.08_40)]">
                {progress.byDifficulty.hard}
              </span>
            </div>
            <p className="text-sm text-[oklch(0.50_0.05_40)]">JEE Advanced Level</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[oklch(0.85_0.03_40)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-[oklch(0.55_0.15_40)]" />
              <span className="text-3xl font-bold text-[oklch(0.40_0.08_40)]">
                {topicProgress?.filter(t => Number(t.correct) > 0).length || 0}
              </span>
            </div>
            <p className="text-sm text-[oklch(0.50_0.05_40)]">Topics Mastered</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[oklch(0.85_0.03_140)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-[oklch(0.60_0.12_140)]" />
              <span className="text-3xl font-bold text-[oklch(0.40_0.08_40)]">
                {progress.recentProblems.length}
              </span>
            </div>
            <p className="text-sm text-[oklch(0.50_0.05_40)]">Recent Solutions</p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-[oklch(0.85_0.03_40)]">
          <CardHeader className="bg-gradient-to-r from-[oklch(0.96_0.02_40)] to-[oklch(0.98_0.01_40)]">
            <CardTitle className="text-[oklch(0.40_0.08_40)]">Difficulty Breakdown</CardTitle>
            <CardDescription>Your performance across JEE difficulty levels</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[oklch(0.45_0.05_40)]">JEE Main - Easy</span>
                <span className="font-semibold text-[oklch(0.40_0.08_40)]">
                  {progress.byDifficulty.easy} solved
                </span>
              </div>
              <Progress 
                value={totalProblems > 0 ? (progress.byDifficulty.easy / totalProblems) * 100 : 0} 
                className="h-3 bg-[oklch(0.92_0.02_40)]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[oklch(0.45_0.05_40)]">JEE Main - Challenging</span>
                <span className="font-semibold text-[oklch(0.40_0.08_40)]">
                  {progress.byDifficulty.medium} solved
                </span>
              </div>
              <Progress 
                value={totalProblems > 0 ? (progress.byDifficulty.medium / totalProblems) * 100 : 0} 
                className="h-3 bg-[oklch(0.92_0.02_40)]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[oklch(0.45_0.05_40)]">JEE Advanced</span>
                <span className="font-semibold text-[oklch(0.40_0.08_40)]">
                  {progress.byDifficulty.hard} solved
                </span>
              </div>
              <Progress 
                value={totalProblems > 0 ? (progress.byDifficulty.hard / totalProblems) * 100 : 0} 
                className="h-3 bg-[oklch(0.92_0.02_40)]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[oklch(0.85_0.03_140)]">
          <CardHeader className="bg-gradient-to-r from-[oklch(0.96_0.02_140)] to-[oklch(0.98_0.01_140)]">
            <CardTitle className="text-[oklch(0.40_0.08_140)]">JEE Topic Performance</CardTitle>
            <CardDescription>Your accuracy across JEE syllabus topics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {topicProgress && topicProgress.length > 0 ? (
              <div className="space-y-4">
                {topicProgress.map((stat) => (
                  <div key={stat.topic} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[oklch(0.45_0.05_40)] font-medium">
                        {TOPIC_LABELS[stat.topic]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[oklch(0.55_0.05_40)]">
                          {Number(stat.correct)}/{Number(stat.attempted)}
                        </span>
                        <Badge 
                          variant="outline"
                          className="border-[oklch(0.60_0.12_140)] text-[oklch(0.45_0.10_140)]"
                        >
                          {stat.accuracy.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={stat.accuracy} 
                      className="h-2 bg-[oklch(0.92_0.02_140)]"
                      style={{
                        // @ts-ignore - CSS custom property
                        '--progress-background': TOPIC_COLORS[stat.topic]
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[oklch(0.55_0.05_40)] py-8">
                Start solving problems to see your topic-wise performance
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {progress.recentProblems.length > 0 && (
        <Card className="max-w-6xl mx-auto mt-6 border-2 border-[oklch(0.85_0.03_40)]">
          <CardHeader className="bg-gradient-to-r from-[oklch(0.96_0.02_40)] to-[oklch(0.96_0.02_140)]">
            <CardTitle className="text-[oklch(0.40_0.08_40)]">Recent Solutions</CardTitle>
            <CardDescription>Your latest JEE problem-solving achievements</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {progress.recentProblems.slice(0, 5).map((problem, index) => (
                <div 
                  key={typeof problem.problemId === 'string' ? problem.problemId : problem.problemId.toString()}
                  className="flex items-center justify-between p-4 rounded-lg bg-[oklch(0.97_0.01_80)] border border-[oklch(0.90_0.02_40)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[oklch(0.55_0.15_40)] text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[oklch(0.40_0.08_40)]">
                        {problem.topic ? TOPIC_LABELS[problem.topic as Topic] : 'Problem solved'}
                      </p>
                      <p className="text-xs text-[oklch(0.55_0.05_40)]">
                        {new Date(problem.solvedAt).toLocaleDateString()} • {problem.steps.length} steps
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[oklch(0.60_0.12_140)] text-white">
                    {Math.floor(problem.timeSpent / 60)}m {problem.timeSpent % 60}s
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
