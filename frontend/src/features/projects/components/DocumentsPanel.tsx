'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { projectService } from '../services/projectService';
import { Document } from '@/types';

interface DocumentsPanelProps {
  projectId: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function DocumentsPanel({ projectId }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    try {
      const res = await projectService.getDocuments(projectId);
      setDocuments(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await projectService.uploadDocument(projectId, file);
      toast.success('Documento enviado!');
      loadDocuments();
    } catch {
      toast.error('Erro ao enviar documento');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Excluir este documento?')) return;
    try {
      await projectService.deleteDocument(projectId, documentId);
      toast.success('Documento excluído');
      loadDocuments();
    } catch {
      toast.error('Erro ao excluir documento');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-1 h-4 w-4" />
          {uploading ? 'Enviando...' : 'Enviar Documento'}
        </Button>
        <span className="text-xs text-[#6b778c]">PDF, Word</span>
      </div>

      <div className="rounded-sm border border-[#dfe1e6] bg-white">
        {documents.length === 0 ? (
          <p className="p-5 text-center text-sm text-[#6b778c]">
            Nenhum documento adicionado
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border-b border-[#dfe1e6] px-3 py-3 last:border-b-0 sm:px-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#deebff]">
                  <FileText className="h-4 w-4 text-[#0052cc]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#172b4d]">{doc.fileName}</p>
                  <p className="text-xs text-[#6b778c]">
                    {formatFileSize(doc.fileSize)}
                    <span className="hidden sm:inline">
                      {' '}&middot; {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 ml-2">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-[#6b778c] hover:text-[#0052cc]"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
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
