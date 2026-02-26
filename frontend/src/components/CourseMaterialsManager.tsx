import React, { useState } from 'react';
import {
  useGetCourseMaterials,
  useAddCourseMaterial,
  useDeleteCourseMaterial,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BookOpen, Trash2, Plus, ChevronUp, ExternalLink } from 'lucide-react';

const COURSES = [
  'JEE Mathematics',
  'NEET Mathematics',
  'Board Exam Prep',
  'Foundation Course',
  'Advanced Problem Solving',
  'Crash Course',
];

const MATERIAL_TYPES = ['pdf', 'video', 'note', 'link'] as const;
type MaterialTypeKey = typeof MATERIAL_TYPES[number];

const TYPE_COLORS: Record<MaterialTypeKey, string> = {
  pdf: 'bg-red-100 text-red-700',
  video: 'bg-blue-100 text-blue-700',
  note: 'bg-yellow-100 text-yellow-700',
  link: 'bg-green-100 text-green-700',
};

function getMaterialTypeKey(type: any): MaterialTypeKey {
  if (typeof type === 'string') return type as MaterialTypeKey;
  return (Object.keys(type ?? {})[0] ?? 'link') as MaterialTypeKey;
}

export default function CourseMaterialsManager() {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const { data: materials = [], isLoading } = useGetCourseMaterials(selectedCourse);
  const addMutation = useAddCourseMaterial();
  const deleteMutation = useDeleteCourseMaterial();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<MaterialTypeKey>('link');
  const [url, setUrl] = useState('');

  const handleAdd = async () => {
    if (!title || !url) return;
    try {
      await addMutation.mutateAsync({
        courseName: selectedCourse,
        title,
        materialType: { [materialType]: null },
        url,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      setTitle('');
      setUrl('');
      setMaterialType('link');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add material:', err);
    }
  };

  const handleDelete = async (materialTitle: string) => {
    try {
      await deleteMutation.mutateAsync(materialTitle);
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Course selector */}
      <div>
        <Label className="text-sm">Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COURSES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1">
          {showForm ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          Add Material
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              placeholder="Material title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialTypeKey)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">URL</Label>
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addMutation.isPending || !title || !url}
              className="flex-1"
            >
              {addMutation.isPending ? 'Adding...' : 'Add Material'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Materials list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading materials...</p>
      ) : materials.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No materials for this course.</p>
      ) : (
        <div className="space-y-2">
          {materials.map((material: any, index: number) => {
            const typeKey = getMaterialTypeKey(material.materialType);
            return (
              <div
                key={index}
                className="bg-card rounded-lg p-3 border border-border flex items-center gap-3"
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${TYPE_COLORS[typeKey] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {typeKey.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{material.title}</p>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline truncate block"
                  >
                    {material.url}
                  </a>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Material?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{material.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(material.title)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
