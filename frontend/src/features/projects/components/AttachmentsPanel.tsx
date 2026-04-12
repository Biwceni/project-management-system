'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { projectService } from '../services/projectService';
import { Attachment } from '@/types';

interface AttachmentsPanelProps {
  projectId: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function AttachmentsPanel({ projectId }: AttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [projectId]);

  const loadAttachments = async () => {
    try {
      const res = await projectService.getAttachments(projectId);
      setAttachments(res.data.data || []);
    } catch {
      /* ignore */
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await projectService.uploadAttachment(projectId, file);
      toast.success('Arquivo enviado!');
      loadAttachments();
    } catch {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Excluir este arquivo?')) return;
    try {
      await projectService.deleteAttachment(projectId, attachmentId);
      toast.success('Arquivo excluído');
      loadAttachments();
    } catch {
      toast.error('Erro ao excluir arquivo');
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-1 h-4 w-4" />
          {uploading ? 'Enviando...' : 'Upload'}
        </Button>
      </div>

      <div className="rounded-sm border border-[#dfe1e6] bg-white">
        {attachments.length === 0 ? (
          <p className="p-5 text-center text-sm text-[#6b778c]">
            Nenhum arquivo anexado
          </p>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between border-b border-[#dfe1e6] px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-[#deebff]">
                  <FileText className="h-4 w-4 text-[#0052cc]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#172b4d]">{att.fileName}</p>
                  <p className="text-xs text-[#6b778c]">
                    {formatFileSize(att.fileSize)} &middot;{' '}
                    {new Date(att.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-[#6b778c] hover:text-[#0052cc]"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(att.id)}
                  className="rounded p-1 text-[#6b778c] hover:text-[#de350b]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
