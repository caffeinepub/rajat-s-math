import React, { useState } from 'react';
import { useGetCourseMaterials, useAddCourseMaterial, useDeleteCourseMaterial } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Video, Link, BookOpen, Trash2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type MaterialTypeKey = 'pdf' | 'video' | 'note' | 'link';

const MATERIAL_TYPE_ICONS: Record<MaterialTypeKey, React.ReactNode> = {
  pdf: <FileText className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  note: <BookOpen className="w-3.5 h-3.5" />,
  link: <Link className="w-3.5 h-3.5" />,
};

const MATERIAL_TYPE_COLORS: Record<MaterialTypeKey, string> = {
  pdf: 'bg-red-100 text-red-700 border-red-200',
  video: 'bg-blue-100 text-blue-700 border-blue-200',
  note: 'bg-green-100 text-green-700 border-green-200',
  link: 'bg-purple-100 text-purple-700 border-purple-200',
};

function getMaterialTypeKey(type: any): MaterialTypeKey {
  if (typeof type === 'string') return type as MaterialTypeKey;
  return (Object.keys(type ?? {})[0] ?? 'link') as MaterialTypeKey;
}

interface StudentMaterialsTabProps {
  courseName: string;
}

export default function StudentMaterialsTab({ courseName }: StudentMaterialsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<MaterialTypeKey>('pdf');
  const [url, setUrl] = useState('');

  const { data: materials, isLoading } = useGetCourseMaterials(courseName);
  const addMaterial = useAddCourseMaterial();
  const removeMaterial = useDeleteCourseMaterial();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('Please fill in title and URL');
      return;
    }
    try {
      await addMaterial.mutateAsync({
        courseName,
        title: title.trim(),
        materialType: { [materialType]: null },
        url: url.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success('Material added');
      setTitle('');
      setUrl('');
      setMaterialType('pdf');
      setShowForm(false);
    } catch {
      toast.error('Failed to add material');
    }
  };

  const handleRemove = async (materialTitle: string) => {
    try {
      await removeMaterial.mutateAsync(materialTitle);
      toast.success('Material removed');
    } catch {
      toast.error('Failed to remove material');
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Materials List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : !materials || materials.length === 0 ? (
        <div className="text-center py-6 text-warm-text/40">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No materials added yet for this student.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((material: any) => {
            const typeKey = getMaterialTypeKey(material.materialType);
            return (
              <div
                key={material.title}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-navy/10 bg-warm-light/30 hover:bg-warm-light/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${MATERIAL_TYPE_COLORS[typeKey] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {MATERIAL_TYPE_ICONS[typeKey]}
                    {typeKey.toUpperCase()}
                  </span>
                  <span className="font-medium text-navy text-sm truncate">{material.title}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-gold/10 text-gold transition-colors"
                    title="Open"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemove(material.title)}
                    disabled={removeMaterial.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form Toggle */}
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full border-dashed border-navy/30 text-navy/70 hover:border-gold hover:text-gold text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Material
        </Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 p-3 rounded-lg border border-gold/30 bg-gold/5">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-navy text-xs font-medium">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Material title"
                className="border-navy/20 focus:ring-gold h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-navy text-xs font-medium">Type *</Label>
              <Select
                value={materialType}
                onValueChange={(v) => setMaterialType(v as MaterialTypeKey)}
              >
                <SelectTrigger className="border-navy/20 focus:ring-gold h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-navy text-xs font-medium">URL / Link *</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="border-navy/20 focus:ring-gold h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={addMaterial.isPending}
              className="bg-navy hover:bg-navy/90 text-cream text-xs h-8"
            >
              {addMaterial.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setTitle('');
                setUrl('');
              }}
              className="text-xs h-8 text-warm-text/60"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
