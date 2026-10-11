import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  Calendar,
  Layers,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Document, KnowledgeSpace } from '../../types';
import { fetchDocuments, uploadDocument, deleteDocument } from '../../services/api';

interface DocumentManagerProps {
  spaces: KnowledgeSpace[];
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ spaces }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
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
        // Create synthetic markdown blob
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-400" />
            <span>Enterprise Knowledge Ingestion & Governance</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manage authority scores, freshness decay timestamps, and space access controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDocs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-teal-500/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-200 leading-tight">
                        {doc.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doc.filename}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 my-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-200">{doc.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authority Level:</span>
                    <span className="font-semibold text-amber-400 capitalize">
                      {doc.authority.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Version & Date:</span>
                    <span className="font-mono text-slate-300 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      v{doc.version} ({doc.effective_date})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indexed Chunks:</span>
                    <span className="font-mono text-teal-400 font-bold">{doc.chunk_count}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-slate-400" />
                  Space: {doc.space_id}
                </span>
                <span className="capitalize">{doc.visibility}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload & Metadata Tagging Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-teal-400" />
              <span>Ingest Document with Authority & Freshness Metadata</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Proper metadata enables the Adaptive Intelligence engine to prioritize official policies over legacy drafts.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select File (PDF, DOCX, TXT, MD)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="w-full text-slate-300 bg-slate-800 p-2 rounded-lg border border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel & Entertainment Expense Policy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700 outline-none"
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
                  <label className="block text-slate-400 mb-1">Authority Level</label>
                  <select
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700 outline-none"
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
                  <label className="block text-slate-400 mb-1">Effective Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Knowledge Space</label>
                <select
                  value={spaceId}
                  onChange={(e) => setSpaceId(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700 outline-none"
                >
                  {spaces.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                >
                  {uploading ? 'Parsing & Indexing...' : 'Parse & Ingest Chunks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
