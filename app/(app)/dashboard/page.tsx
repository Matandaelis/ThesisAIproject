'use client';

import { FileText, CheckCircle, Clock, Zap, Plus, ArrowRight, BookOpen, Library, MoreVertical, Target, Award, TrendingUp, Calendar, Folder, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const activityData = [
  { name: 'Mon', words: 400 },
  { name: 'Tue', words: 3000 },
  { name: 'Wed', words: 2000 },
  { name: 'Thu', words: 2780 },
  { name: 'Fri', words: 1890 },
  { name: 'Sat', words: 2390 },
  { name: 'Sun', words: 3490 },
];

const thesisProgressData = [
  { name: 'Introduction', progress: 100 },
  { name: 'Literature Review', progress: 85 },
  { name: 'Methodology', progress: 60 },
  { name: 'Results', progress: 30 },
  { name: 'Discussion', progress: 10 },
  { name: 'Conclusion', progress: 0 },
];

export default function DashboardPage() {
  const stats = [
    { name: 'Total Documents', value: '12', trend: '+2 this week', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { name: 'Words Written', value: '24.5k', trend: '+3.2k this week', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'Hours Focused', value: '42.5', trend: '+5.4h this week', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { name: 'AI Credits', value: '850', trend: 'Resets in 5 days', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  ];

  const recentDocs = [
    { id: '1', title: 'Impact of AI on Education', status: 'Draft', progress: 65, lastEdited: '2 hours ago', wordCount: '4,200', chapter: 'Literature Review' },
    { id: '2', title: 'Machine Learning in Healthcare', status: 'Review', progress: 90, lastEdited: '1 day ago', wordCount: '12,500', chapter: 'Methodology' },
    { id: '3', title: 'Quantum Computing Basics', status: 'Final', progress: 100, lastEdited: '3 days ago', wordCount: '8,900', chapter: 'Introduction' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold border-4 border-white shadow-sm">
            AL
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Welcome back, Alex</h1>
            <p className="text-neutral-500 mt-1 text-sm sm:text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Current Goal: Finish Literature Review by Friday
            </p>
          </div>
        </div>
        <Link 
          href="/editor/new" 
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Document
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-semibold text-neutral-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-neutral-500 mt-1">{stat.name}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <p className="text-xs font-medium text-neutral-400">{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content Area - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Thesis Progress Tracker */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Overall Thesis Progress</h2>
                <p className="text-sm text-neutral-500">Master&apos;s Thesis in Computer Science</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-600">45%</span>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Completed</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {thesisProgressData.map((chapter) => (
                <div key={chapter.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-neutral-700 truncate">{chapter.name}</div>
                  <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${chapter.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${chapter.progress}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs font-medium text-neutral-500">{chapter.progress}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Writing Activity</h2>
              <select className="text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#e5e5e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="words" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorWords)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Documents</h2>
              <Link href="/documents" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/editor/${doc.id}`} className="text-base font-medium text-neutral-900 hover:text-indigo-600 transition-colors truncate">
                        {doc.title}
                      </Link>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0
                        ${doc.status === 'Draft' ? 'bg-neutral-100 text-neutral-600' : ''}
                        ${doc.status === 'Review' ? 'bg-amber-100 text-amber-700' : ''}
                        ${doc.status === 'Final' ? 'bg-emerald-100 text-emerald-700' : ''}
                      `}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5" />
                        {doc.chapter}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {doc.lastEdited}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {doc.wordCount} words
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:w-48">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-neutral-500">Progress</span>
                        <span className="font-medium text-neutral-900">{doc.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${doc.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                    </div>
                    <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Area - 1/3 width on desktop */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Quick Actions Bento */}
          <div className="bg-neutral-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <h2 className="text-lg font-semibold mb-6 relative z-10">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <Link href="/templates" className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-3 group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-sm font-medium">Templates</span>
              </Link>
              <Link href="/citations" className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-3 group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Library className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-sm font-medium">Citations</span>
              </Link>
              <Link href="/editor/new" className="col-span-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 p-4 rounded-xl transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold">Start Blank</span>
                    <span className="block text-xs text-indigo-200">New document</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Upcoming Deadlines / Tasks */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Upcoming Goals</h2>
              <Calendar className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {[
                { title: 'Finish Literature Review', date: 'Tomorrow, 5:00 PM', color: 'bg-amber-500', icon: BookOpen },
                { title: 'Submit Draft to Supervisor', date: 'Oct 24, 2026', color: 'bg-indigo-500', icon: FileText },
                { title: 'Format Citations (APA 7)', date: 'Oct 28, 2026', color: 'bg-emerald-500', icon: Library },
              ].map((task, i) => {
                const TaskIcon = task.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100">
                    <div className={`p-2 rounded-lg bg-white shadow-sm border border-neutral-100 flex-shrink-0`}>
                      <TaskIcon className={`w-4 h-4 ${task.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{task.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-transparent">
              + Add Goal
            </button>
          </div>

          {/* Achievements / Badges */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Achievements</h2>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg">🔥</div>
                <span className="text-xs font-medium text-amber-900">7 Day Streak</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">📚</div>
                <span className="text-xs font-medium text-emerald-900">10k Words</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">🎯</div>
                <span className="text-xs font-medium text-indigo-900">Goal Met</span>
              </div>
            </div>
          </div>

          {/* AI Quick Prompt */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-indigo-900">Ask AI Copilot</h2>
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-xs text-indigo-700/80 mb-3">Need a quick idea or literature summary? Ask your AI assistant.</p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g., Summarize recent papers on..." 
                className="w-full bg-white border border-indigo-200 rounded-xl py-2.5 pl-3 pr-10 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-neutral-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Feedback</h2>
              <MessageSquare className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {[
                { name: 'Dr. Smith', role: 'Supervisor', comment: 'Great methodology section. Expand on the limitations.', time: '2h ago', doc: 'Impact of AI...' },
                { name: 'Sarah J.', role: 'Peer', comment: 'I think citation [4] is outdated. Check the 2025 paper.', time: '1d ago', doc: 'Machine Learning...' },
              ].map((feedback, i) => (
                <div key={i} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">{feedback.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-neutral-200 text-neutral-600">{feedback.role}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{feedback.time}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2 leading-snug">&quot;{feedback.comment}&quot;</p>
                  <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {feedback.doc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Status */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-neutral-900">Cloud Storage</h2>
              <span className="text-xs font-medium text-neutral-500">2.4 GB / 5 GB</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '48%' }}></div>
            </div>
            <p className="text-xs text-neutral-500">You have used 48% of your available storage for documents and PDFs.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
