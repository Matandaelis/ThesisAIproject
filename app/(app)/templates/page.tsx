import { FileText, Search } from 'lucide-react';

export default function TemplatesPage() {
  const templates = [
    { id: 'ku', name: 'Kenyatta University', type: 'Thesis Proposal', citation: 'APA 7th', format: 'Times New Roman 12pt, 1.5 spacing' },
    { id: 'kemu', name: 'Kenya Methodist University', type: 'Postgraduate Thesis', citation: 'Harvard', format: 'Times New Roman 12pt, 1.5 spacing' },
    { id: 'mku', name: 'Mount Kenya University', type: 'Research Project', citation: 'APA/MLA', format: 'Standard A4' },
    { id: 'laikipia', name: 'Laikipia University', type: 'General Guidelines', citation: 'Mixed', format: 'A4, English' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">University Templates</h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">Start your document with pre-configured formatting rules.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input 
          type="text" 
          placeholder="Search universities..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">{template.name}</h3>
            <p className="text-sm text-neutral-500 mb-4">{template.type}</p>
            
            <div className="space-y-2 mb-6 flex-1 bg-neutral-50 p-3 rounded-xl">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-neutral-500">Citation Style</span>
                <span className="font-medium text-neutral-900">{template.citation}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-neutral-500">Formatting</span>
                <span className="font-medium text-neutral-900 truncate ml-4">{template.format}</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl transition-colors text-sm sm:text-base shadow-sm">
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
