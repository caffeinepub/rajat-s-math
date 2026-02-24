import React, { useState } from 'react';
import { CourseMaterialType } from '../backend';
import {
  useGetCourseMaterials,
  useAddCourseMaterial,
  useRemoveCourseMaterial,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Video, Link, BookOpen, Trash2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const COURSE_NAMES = [
  'One-on-One Mathematics Tutoring',
  'Group Mathematics Classes',
  'Intensive Problem Solving Workshop',
  'Foundation Mathematics Course',
  'Advanced Mathematics Program',
];

const MATERIAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  note: <BookOpen className="w-4 h-4" />,
  link: <Link className="w-4 h-4" />,
};

const MATERIAL_TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 border-red-200',
  video: 'bg-blue-100 text-blue-700 border-blue-200',
  note: 'bg-green-100 text-green-700 border-green-200',
  link: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function CourseMaterialsManager() {
  const [selectedCourse, setSelectedCourse] = useState(COURSE_NAMES[0]);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<CourseMaterialType>(CourseMaterialType.pdf);
  const [url, setUrl] = useState('');

  const { data: materials, isLoading } = useGetCourseMaterials(selectedCourse);
  const addMaterial = useAddCourseMaterial();
  const removeMaterial = useRemoveCourseMaterial();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await addMaterial.mutateAsync({
        courseName: selectedCourse,
        title: title.trim(),
        materialType,
        url: url.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success('Material added successfully');
      setTitle('');
      setUrl('');
    } catch (err) {
      toast.error('Failed to add material');
    }
  };

  const handleRemove = async (materialTitle: string) => {
    try {
      await removeMaterial.mutateAsync({ title: materialTitle, courseName: selectedCourse });
      toast.success('Material removed');
    } catch (err) {
      toast.error('Failed to remove material');
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="space-y-2">
        <Label className="text-navy font-semibold">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="border-navy/20 focus:ring-gold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COURSE_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materials List */}
      <Card className="border-navy/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-navy text-base font-semibold">
            Course Materials
            {materials && (
              <span className="ml-2 text-sm font-normal text-warm-text/60">
                ({materials.length} items)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !materials || materials.length === 0 ? (
            <div className="text-center py-8 text-warm-text/50">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No materials added yet for this course.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materials.map((material) => (
                <div
                  key={material.title}
                  className="flex items-center justify-between p-3 rounded-lg border border-navy/10 bg-warm-light/30 hover:bg-warm-light/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${MATERIAL_TYPE_COLORS[material.materialType]}`}
                    >
                      {MATERIAL_TYPE_ICONS[material.materialType]}
                      {material.materialType.toUpperCase()}
                    </span>
                    <span className="font-medium text-navy text-sm truncate">{material.title}</span>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold/70 flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    onClick={() => handleRemove(material.title)}
                    disabled={removeMaterial.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Material Form */}
      <Card className="border-gold/30 bg-gold/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-navy text-base font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold" />
            Add New Material
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-navy text-sm">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 1 Notes"
                  className="border-navy/20 focus:ring-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-navy text-sm">Type</Label>
                <Select
                  value={materialType}
                  onValueChange={(v) => setMaterialType(v as CourseMaterialType)}
                >
                  <SelectTrigger className="border-navy/20 focus:ring-gold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseMaterialType.pdf}>PDF</SelectItem>
                    <SelectItem value={CourseMaterialType.video}>Video</SelectItem>
                    <SelectItem value={CourseMaterialType.note}>Note</SelectItem>
                    <SelectItem value={CourseMaterialType.link}>Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-navy text-sm">URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="border-navy/20 focus:ring-gold"
              />
            </div>
            <Button
              type="submit"
              disabled={addMaterial.isPending}
              className="bg-navy hover:bg-navy/90 text-cream"
            >
              {addMaterial.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Material
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
