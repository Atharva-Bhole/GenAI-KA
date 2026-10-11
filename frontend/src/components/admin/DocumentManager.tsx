import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Database,
  FileText,
  FileUp,
  FolderGit2,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { deleteDocument, fetchDocuments, uploadDocument } from '../../services/api';
import { Document, KnowledgeSpace } from '../../types';

interface DocumentManagerProps {
  spaces: KnowledgeSpace[];
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ spaces }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('HR');
  const [effectiveDate, setEffectiveDate] = useState('2026-05-01');
  const [version, setVersion] = useState('1.0');
  const [authority, setAuthority] = useState('official_policy');
  const [owner, setOwner] = useState('Department Lead');
  const [spaceId, setSpaceId] = useState('company-wide');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this document and all its indexed chunks?')) return;
    try {
      await deleteDocument(id);
      loadDocs();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !title) return;

    setUploading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        const blob = new Blob([`# ${title}\n\nDocument ingested into ${department} knowledge space.`], { type: 'text/markdown' });
        formData.append('file', blob, `${title.replace(/\s+/g, '_')}.md`);
      }
      formData.append('title', title);
      formData.append('department', department);
      formData.append('effective_date', effectiveDate);
      formData.append('version', version);
      formData.append('authority', authority);
      formData.append('owner', owner);
      formData.append('visibility', 'internal');
      formData.append('space_id', spaceId);

      await uploadDocument(formData);
      setShowUploadModal(false);
      setFile(null);
      setTitle('');
      loadDocs();
    } catch (e) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getAuthorityBadge = (auth: string) => {
    switch (auth) {
      case 'official_policy':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'standard':
        return 'bg-brand-500/10 text-brand-300 border-brand-500/30';
      case 'sop':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'guideline':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/[0.08]';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-dark-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Database className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Enterprise Knowledge Ingestion</h2>
              <span className="px-2 py-0.5 rounded-full bg-dark-800 border border-white/[0.05] text-[10px] font-mono text-brand-300">
                {documents.length} sources indexed
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Authoritative document registry with version-controlled chunk indexing and decay parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDocs}
            className="p-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 border border-white/[0.05] hover:border-white/[0.1] transition-all"
            title="Refresh Sources"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-dark-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Source</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-dark-900/70 border border-white/[0.07] hover:border-brand-500/30 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-brand-500/5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-dark-800/90 border border-white/[0.06] flex items-center justify-center text-brand-400 shrink-0 group-hover:border-brand-500/30 transition-colors">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                        {doc.title}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono truncate block">
                        {doc.filename}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Delete source"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-[11px] my-3.5 p-3 rounded-xl bg-dark-950/60 border border-white/[0.04]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-200">{doc.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Authority Level:</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono capitalize font-medium ${getAuthorityBadge(doc.authority)}`}>
                      {doc.authority.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Version & Date:</span>
                    <span className="font-mono text-slate-300 flex items-center gap-1 text-[10px]">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      v{doc.version} ({doc.effective_date})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Indexed Chunks:</span>
                    <span className="font-mono text-brand-300 font-bold bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 text-[10px]">
                      {doc.chunk_count} chunks
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FolderGit2 className="h-3 w-3 text-slate-500" />
                  Space: <strong className="text-slate-300">{doc.space_id}</strong>
                </span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-dark-800 border border-white/[0.04] text-slate-400">
                  {doc.visibility}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-dark-900 border border-white/[0.09] rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-black/90">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ingest Organizational Knowledge</h3>
                  <p className="text-[11px] text-slate-400">Parse chunks, compute embeddings & assign authority hierarchy</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="p-4 rounded-xl border border-dashed border-white/[0.12] bg-dark-950/60 hover:border-brand-500/40 text-center transition-all cursor-pointer">
                <FileUp className="h-7 w-7 text-brand-400 mx-auto mb-2 opacity-80" />
                <label className="block text-slate-300 font-semibold mb-1 cursor-pointer">
                  {file ? file.name : 'Select PDF, DOCX, TXT or MD File'}
                </label>
                <span className="text-[10px] text-slate-500">
                  Will be parsed and chunked with sliding window preservation
                </span>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="hidden"
                  id="modal-file-upload"
                />
                <div className="mt-2.5">
                  <label
                    htmlFor="modal-file-upload"
                    className="inline-block px-3 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-[11px] font-medium border border-white/[0.06] cursor-pointer"
                  >
                    Browse Local File
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel & Entertainment Expense Policy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-dark-850 text-slate-100 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-dark-850 text-slate-100 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none"
                  >
                    <option value="HR">HR</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Information Security">Information Security</option>
                    <option value="Legal">Legal</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Authority Level</label>
                  <select
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    className="w-full bg-dark-850 text-slate-100 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none"
                  >
                    <option value="official_policy">Official Policy (Weight 1.0)</option>
                    <option value="standard">Standard (Weight 0.85)</option>
                    <option value="sop">SOP (Weight 0.75)</option>
                    <option value="guideline">Guideline (Weight 0.60)</option>
                    <option value="faq">FAQ (Weight 0.50)</option>
                    <option value="memo">Memo / Internal Note (0.35)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-dark-850 text-slate-100 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-dark-850 text-slate-100 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Knowledge Space</label>
                <select
                  value={spaceId}
                  onChange={(e) => setSpaceId(e.target.value)}
                  className="w-full bg-dark-850 text-slate-100 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none"
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-dark-800 text-slate-300 hover:bg-dark-750 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-dark-950 font-bold hover:from-brand-400 hover:to-brand-300 transition-all shadow-md shadow-brand-500/20"
                >
                  {uploading ? 'Parsing & Indexing Chunks...' : 'Parse & Ingest Chunks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
