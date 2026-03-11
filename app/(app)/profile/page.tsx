import { User, Mail, Building, BookMarked, Shield, Bell, Key, CreditCard, LogOut, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Profile & Settings</h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">Manage your account details, preferences, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column - Navigation/Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-sm">
              AL
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Alex Learner</h2>
            <p className="text-neutral-500 text-sm mb-4">alex.learner@example.com</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pro Plan Active
            </span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            <nav className="flex flex-col p-2">
              <a href="#personal" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl transition-colors">
                <User className="w-4 h-4" /> Personal Info
              </a>
              <a href="#academic" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors">
                <Building className="w-4 h-4" /> Academic Details
              </a>
              <a href="#integrations" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors">
                <BookMarked className="w-4 h-4" /> Integrations
              </a>
              <a href="#security" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors">
                <Shield className="w-4 h-4" /> Security
              </a>
              <a href="#notifications" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors">
                <Bell className="w-4 h-4" /> Notifications
              </a>
            </nav>
          </div>
        </div>

        {/* Right Column - Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <div id="personal" className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">Personal Information</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">First Name</label>
                <input type="text" defaultValue="Alex" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Last Name</label>
                <input type="text" defaultValue="Learner" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-neutral-700">Email Address</label>
                <input type="email" defaultValue="alex.learner@example.com" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>

          {/* Academic Details */}
          <div id="academic" className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">Academic Details</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-neutral-700">University / Institution</label>
                <select className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm">
                  <option>Kenyatta University</option>
                  <option>Kenya Methodist University</option>
                  <option>Mount Kenya University</option>
                  <option>Laikipia University</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Degree Program</label>
                <input type="text" defaultValue="MSc Computer Science" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Default Citation Style</label>
                <select className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm">
                  <option>APA 7th Edition</option>
                  <option>MLA 9th Edition</option>
                  <option>Harvard</option>
                  <option>Chicago</option>
                </select>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div id="integrations" className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">Connected Accounts</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-neutral-200 rounded-xl gap-4 hover:border-neutral-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold text-xl flex-shrink-0">M</div>
                  <div>
                    <p className="font-medium text-neutral-900">Mendeley</p>
                    <p className="text-sm text-neutral-500">Sync your reference library</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                  Connect
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-emerald-200 bg-emerald-50/30 rounded-xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xl flex-shrink-0">Z</div>
                  <div>
                    <p className="font-medium text-neutral-900">Zotero</p>
                    <p className="text-sm text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected as alex.learner
                    </p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors shadow-sm">
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div id="security" className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-neutral-900">Password</p>
                  <p className="text-sm text-neutral-500">Last changed 3 months ago</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-neutral-900">Two-Factor Authentication</p>
                  <p className="text-sm text-neutral-500">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="px-5 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
