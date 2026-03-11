import { BookOpen, Search, Plus, ExternalLink } from 'lucide-react';

export default function CitationsPage() {
  const citations = [
    { id: '1', title: 'Attention is All You Need', authors: 'Vaswani, A. et al.', year: 2017, source: 'Semantic Scholar', type: 'Conference Paper' },
    { id: '2', title: 'Deep Residual Learning for Image Recognition', authors: 'He, K. et al.', year: 2016, source: 'Mendeley', type: 'Journal Article' },
    { id: '3', title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin, J. et al.', year: 2019, source: 'Zotero', type: 'Preprint' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Citation Library</h1>
          <p className="text-neutral-500 mt-1 text-sm sm:text-base">Manage your references across Mendeley, Zotero, and Semantic Scholar.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button className="flex-1 sm:flex-none justify-center bg-white border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl font-medium hover:bg-neutral-50 transition-colors shadow-sm flex items-center gap-2 text-sm sm:text-base">
            <ExternalLink className="w-4 h-4" />
            Sync
          </button>
          <button className="flex-1 sm:flex-none justify-center bg-neutral-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-2 text-sm sm:text-base">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search your library..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-sm sm:text-base"
          />
        </div>
        <div className="hidden sm:block w-px h-6 bg-neutral-200"></div>
        <div className="w-full sm:w-auto border-t sm:border-t-0 border-neutral-200 pt-2 sm:pt-0 pl-2">
          <select className="w-full sm:w-auto bg-transparent border-none text-sm font-medium text-neutral-700 focus:outline-none pr-4 cursor-pointer">
            <option>All Sources</option>
            <option>Mendeley</option>
            <option>Zotero</option>
            <option>Semantic Scholar</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-medium text-neutral-500">Title</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-neutral-500">Authors</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-neutral-500">Year</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-neutral-500">Source</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-neutral-500">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {citations.map((citation) => (
                <tr key={citation.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-medium text-neutral-900 max-w-[200px] sm:max-w-xs truncate">{citation.title}</td>
                  <td className="px-4 sm:px-6 py-4 text-neutral-600 max-w-[150px] truncate">{citation.authors}</td>
                  <td className="px-4 sm:px-6 py-4 text-neutral-600">{citation.year}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-50 text-indigo-700">
                      {citation.source}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-neutral-600">{citation.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
