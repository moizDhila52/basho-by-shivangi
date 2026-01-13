'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Assuming you have this or use alert

export default function AdminNewsletterPage() {
  const [data, setData] = useState({ products: [], workshops: [], events: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Selection State
  const [selectedType, setSelectedType] = useState(null); // 'PRODUCT', 'WORKSHOP', 'EVENT'
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
      setData(json);
    } catch (err) {
      console.error(err);
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
      fetchData(); // Refresh history
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading newsletter dashboard...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#442D1C]">Newsletter Manager</h1>
        <p className="text-[#8E5022]">Curate and broadcast updates to your community.</p>
      </div>

      {/* SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: PRODUCTS */}
        <div 
          onClick={() => { setSelectedType('PRODUCT'); setSelectedItem(null); }}
          className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${selectedType === 'PRODUCT' ? 'border-[#C85428] bg-[#FDFBF7]' : 'border-gray-200 hover:border-[#EDD8B4]'}`}
        >
          <div className="text-4xl mb-4">🏺</div>
          <h3 className="font-bold text-lg text-[#442D1C]">Feature a Product</h3>
          <p className="text-sm text-gray-500 mt-2">Promote a new arrival or bestseller.</p>
        </div>

        {/* CARD 2: WORKSHOPS */}
        <div 
          onClick={() => { setSelectedType('WORKSHOP'); setSelectedItem(null); }}
          className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${selectedType === 'WORKSHOP' ? 'border-[#C85428] bg-[#FDFBF7]' : 'border-gray-200 hover:border-[#EDD8B4]'}`}
        >
          <div className="text-4xl mb-4">👐</div>
          <h3 className="font-bold text-lg text-[#442D1C]">Promote Workshop</h3>
          <p className="text-sm text-gray-500 mt-2">Fill seats for upcoming classes.</p>
        </div>

        {/* CARD 3: EVENTS */}
        <div 
          onClick={() => { setSelectedType('EVENT'); setSelectedItem(null); }}
          className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${selectedType === 'EVENT' ? 'border-[#C85428] bg-[#FDFBF7]' : 'border-gray-200 hover:border-[#EDD8B4]'}`}
        >
          <div className="text-4xl mb-4">🗓️</div>
          <h3 className="font-bold text-lg text-[#442D1C]">Announce Event</h3>
          <p className="text-sm text-gray-500 mt-2">Invite users to exhibitions or popups.</p>
        </div>
      </div>

      {/* EDITOR SECTION (Shows when a type is selected) */}
      {selectedType && (
        <div className="bg-white border border-[#EDD8B4] rounded-xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <span className="text-[#C85428]">Step 2:</span> Configure {selectedType.toLowerCase()} campaign
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-[#442D1C]">Select Item</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#C85428] focus:border-[#C85428]"
                onChange={(e) => {
                  const id = e.target.value;
                  const list = selectedType === 'PRODUCT' ? data.products : selectedType === 'WORKSHOP' ? data.workshops : data.events;
                  setSelectedItem(list.find(i => i.id === id));
                }}
              >
                <option value="">-- Choose {selectedType.toLowerCase()} --</option>
                {(selectedType === 'PRODUCT' ? data.products : selectedType === 'WORKSHOP' ? data.workshops : data.events).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.title}
                  </option>
                ))}
              </select>

              {selectedItem && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[#442D1C] mb-1">Custom Subject (Optional)</label>
                    <input 
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder={`e.g. Look at our new ${selectedItem.name || selectedItem.title}`}
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#442D1C] mb-1">Custom Message (Optional)</label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg h-32"
                      placeholder="Add a personal note to the email body..."
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* PREVIEW BOX */}
            <div className="bg-[#F9F5F0] p-6 rounded-lg border border-gray-200">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8E5022] mb-4">Email Preview</h3>
              {selectedItem ? (
                <div className="bg-white p-4 rounded shadow-sm text-center">
                   <img 
                    src={selectedItem.images ? selectedItem.images[0] : selectedItem.image} 
                    className="w-32 h-32 object-cover mx-auto mb-4 rounded" 
                    alt="Preview"
                   />
                   <h4 className="font-serif font-bold text-lg">{selectedItem.name || selectedItem.title}</h4>
                   <p className="text-sm text-gray-500 mt-2">{customMessage || "Default description will appear here..."}</p>
                   <button className="bg-[#442D1C] text-white px-4 py-2 text-sm rounded mt-4 w-full">Action Button</button>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">Select an item to see preview</div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSend}
              disabled={!selectedItem || sending}
              className="bg-[#C85428] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#b0461f] disabled:opacity-50 transition-colors"
            >
              {sending ? 'Sending...' : 'Send Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="mt-12">
        <h2 className="text-xl font-serif font-bold text-[#442D1C] mb-4">Campaign History</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F9F5F0] text-[#8E5022] text-sm uppercase">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Recipients</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.history.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No campaigns sent yet.</td></tr>
              ) : (
                data.history.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(camp.sentAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-[#442D1C]">{camp.subject}</td>
                    <td className="p-4"><span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">{camp.type}</span></td>
                    <td className="p-4 text-right text-sm text-gray-600">{camp.recipientCount}</td>
                    <td className="p-4 text-right">
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">{camp.status}</span>
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