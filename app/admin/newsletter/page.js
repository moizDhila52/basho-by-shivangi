'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, 
  Palette, 
  Calendar, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Mail,
  ChevronDown
} from 'lucide-react';

export default function AdminNewsletterPage() {
  // 1. Ensure initial state is safe
  const [data, setData] = useState({ products: [], workshops: [], events: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Selection State
  const [selectedType, setSelectedType] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      const json = await res.json();
      
      // 2. BUG FIX: Check if response is OK before setting state
      // If the API returns { error: "..." }, we don't want to replace our state with it.
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedItem) return toast.error("Please select an item first");
    if (!confirm(`Are you sure you want to send this to all subscribers?`)) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          selectedItem: selectedItem,
          customSubject,
          customMessage
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success(`Newsletter sent to ${result.count} subscribers!`);
      setSelectedType(null);
      setSelectedItem(null);
      setCustomMessage('');
      setCustomSubject('');
      fetchData(); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#8E5022]">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p>Loading dashboard...</p>
    </div>
  );

  // Helper to ensure lists are always arrays (Safe Access)
  const productList = data.products || [];
  const workshopList = data.workshops || [];
  const eventList = data.events || [];
  const historyList = data.history || []; // <--- Prevents the crash

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#442D1C]">Newsletter Manager</h1>
        <p className="text-[#8E5022] mt-1">Curate and broadcast updates to your community.</p>
      </div>

      {/* SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: PRODUCTS */}
        <div 
          onClick={() => { setSelectedType('PRODUCT'); setSelectedItem(null); }}
          className={`cursor-pointer group relative border rounded-2xl p-6 transition-all duration-300 ${
            selectedType === 'PRODUCT' 
              ? 'border-[#C85428] bg-[#FDFBF7] shadow-md' 
              : 'border-[#EDD8B4] hover:border-[#C85428]/50 hover:bg-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
            selectedType === 'PRODUCT' ? 'bg-[#C85428] text-white' : 'bg-[#EDD8B4]/20 text-[#8E5022]'
          }`}>
            <ShoppingBag size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#442D1C]">Feature a Product</h3>
          <p className="text-sm text-[#8E5022]/80 mt-2">Promote a new arrival or bestseller.</p>
          {selectedType === 'PRODUCT' && <div className="absolute top-4 right-4 text-[#C85428]"><CheckCircle2 size={20}/></div>}
        </div>

        {/* CARD 2: WORKSHOPS */}
        <div 
          onClick={() => { setSelectedType('WORKSHOP'); setSelectedItem(null); }}
          className={`cursor-pointer group relative border rounded-2xl p-6 transition-all duration-300 ${
            selectedType === 'WORKSHOP' 
              ? 'border-[#C85428] bg-[#FDFBF7] shadow-md' 
              : 'border-[#EDD8B4] hover:border-[#C85428]/50 hover:bg-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
            selectedType === 'WORKSHOP' ? 'bg-[#C85428] text-white' : 'bg-[#EDD8B4]/20 text-[#8E5022]'
          }`}>
            <Palette size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#442D1C]">Promote Workshop</h3>
          <p className="text-sm text-[#8E5022]/80 mt-2">Fill seats for upcoming classes.</p>
          {selectedType === 'WORKSHOP' && <div className="absolute top-4 right-4 text-[#C85428]"><CheckCircle2 size={20}/></div>}
        </div>

        {/* CARD 3: EVENTS */}
        <div 
          onClick={() => { setSelectedType('EVENT'); setSelectedItem(null); }}
          className={`cursor-pointer group relative border rounded-2xl p-6 transition-all duration-300 ${
            selectedType === 'EVENT' 
              ? 'border-[#C85428] bg-[#FDFBF7] shadow-md' 
              : 'border-[#EDD8B4] hover:border-[#C85428]/50 hover:bg-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
            selectedType === 'EVENT' ? 'bg-[#C85428] text-white' : 'bg-[#EDD8B4]/20 text-[#8E5022]'
          }`}>
            <Calendar size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#442D1C]">Announce Event</h3>
          <p className="text-sm text-[#8E5022]/80 mt-2">Invite users to exhibitions.</p>
          {selectedType === 'EVENT' && <div className="absolute top-4 right-4 text-[#C85428]"><CheckCircle2 size={20}/></div>}
        </div>
      </div>

      {/* EDITOR SECTION */}
      {selectedType && (
        <div className="bg-white border border-[#EDD8B4] rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3 text-[#442D1C]">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#442D1C] text-[#EDD8B4] text-sm">2</span>
            Configure {selectedType.toLowerCase()} campaign
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#442D1C] uppercase tracking-wider">Select {selectedType === 'PRODUCT' ? 'Product' : selectedType === 'WORKSHOP' ? 'Workshop' : 'Event'}</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none p-4 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:ring-2 focus:ring-[#C85428]/20 focus:border-[#C85428] outline-none text-[#442D1C] font-medium transition-all cursor-pointer"
                    onChange={(e) => {
                      const id = e.target.value;
                      const list = selectedType === 'PRODUCT' ? productList : selectedType === 'WORKSHOP' ? workshopList : eventList;
                      setSelectedItem(list.find(i => i.id === id));
                    }}
                    value={selectedItem?.id || ""}
                  >
                    <option value="" disabled>-- Choose an item to promote --</option>
                    {(selectedType === 'PRODUCT' ? productList : selectedType === 'WORKSHOP' ? workshopList : eventList).map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E5022] pointer-events-none" size={20} />
                </div>
              </div>

              {selectedItem && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#442D1C] uppercase tracking-wider">Subject Line</label>
                    <input 
                      type="text"
                      className="w-full p-4 bg-white border border-[#EDD8B4] rounded-xl focus:ring-2 focus:ring-[#C85428]/20 focus:border-[#C85428] outline-none text-[#442D1C]"
                      placeholder={`e.g. You'll love our new ${selectedItem.name || selectedItem.title}`}
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#442D1C] uppercase tracking-wider">Personal Message</label>
                    <textarea 
                      className="w-full p-4 bg-white border border-[#EDD8B4] rounded-xl h-40 focus:ring-2 focus:ring-[#C85428]/20 focus:border-[#C85428] outline-none text-[#442D1C] resize-none"
                      placeholder="Add a personal touch to the email body..."
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* PREVIEW BOX */}
            <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-[#EDD8B4] flex flex-col h-full">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8E5022] mb-6 flex items-center gap-2">
                <Mail size={16} /> Email Preview
              </h3>
              
              {selectedItem ? (
                <div className="bg-white p-6 rounded-xl border border-[#EDD8B4]/30 shadow-sm flex-1 flex flex-col items-center text-center">
                   <div className="w-full h-48 rounded-lg overflow-hidden mb-6 bg-gray-100">
                     <img 
                       src={selectedItem.images ? selectedItem.images[0] : selectedItem.image} 
                       className="w-full h-full object-cover" 
                       alt="Preview"
                       onError={(e) => e.target.src = '/placeholder.jpg'}
                     />
                   </div>
                   <h4 className="font-serif font-bold text-2xl text-[#442D1C] mb-2">{selectedItem.name || selectedItem.title}</h4>
                   {selectedType === 'PRODUCT' && <p className="text-[#C85428] font-bold mb-4">₹{selectedItem.price}</p>}
                   
                   <p className="text-sm text-[#8E5022] leading-relaxed mb-6">
                     {customMessage || (selectedItem.description ? selectedItem.description.substring(0, 100) + "..." : "Description text...")}
                   </p>
                   
                   <button className="bg-[#442D1C] text-[#EDD8B4] px-8 py-3 rounded-full text-sm font-bold mt-auto hover:bg-[#2c1d12] transition-colors">
                     View Details
                   </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#EDD8B4] border-2 border-dashed border-[#EDD8B4] rounded-xl">
                  <p>Select an item to preview</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EDD8B4] flex justify-end">
            <button 
              onClick={handleSend}
              disabled={!selectedItem || sending}
              className="bg-[#C85428] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#A0401D] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform active:scale-95"
            >
              {sending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              {sending ? 'Sending Campaign...' : 'Launch Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="mt-16">
        <h2 className="text-xl font-serif font-bold text-[#442D1C] mb-6">Campaign History</h2>
        <div className="bg-white border border-[#EDD8B4] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#FDFBF7] text-[#8E5022] text-xs font-bold uppercase tracking-wider border-b border-[#EDD8B4]">
              <tr>
                <th className="p-5">Date</th>
                <th className="p-5">Subject</th>
                <th className="p-5">Type</th>
                <th className="p-5 text-right">Recipients</th>
                <th className="p-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FDFBF7]">
              {/* 3. BUG FIX: Use the safe 'historyList' variable here */}
              {historyList.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[#8E5022]/60 italic">No campaigns sent yet.</td></tr>
              ) : (
                historyList.map((camp) => (
                  <tr key={camp.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                    <td className="p-5 text-sm text-[#442D1C]">
                      {new Date(camp.sentAt).toLocaleDateString()}
                    </td>
                    <td className="p-5 font-medium text-[#442D1C]">{camp.subject}</td>
                    <td className="p-5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        camp.type === 'PRODUCT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        camp.type === 'WORKSHOP' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {camp.type}
                      </span>
                    </td>
                    <td className="p-5 text-right text-sm text-[#8E5022]">{camp.recipientCount}</td>
                    <td className="p-5 text-right">
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1 justify-end w-fit ml-auto">
                        <CheckCircle2 size={10} /> SENT
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}