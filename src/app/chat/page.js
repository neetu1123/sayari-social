'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useMoodTheme } from '@/components/MoodThemeContext';
import { Send, User, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

const CREATOR_AUTO_REPLIES = {
  mirza_ghalib: [
    "Aha! Kuch toh baat hai aapki baaton mein. Ek sher arz hai:\n'Ishq par zor nahi hai ye woh aatish Ghalib,\nJo lagaye na lage aur bujhai na bane.'",
    "Ghalib ke daur ki baatein hi alag thi, par aapke alfaaz ne purani yaadein taaza kar di.",
    "Khairiyat? Alfaaz bade gehre hain aapke, dosti bani rahe.",
    "Duniya me bohot shayar hain Ghalib ke baad, par aapka shauq dekh kar khushi hui."
  ],
  kavita_sharma: [
    "Dhanyawaad aapka! Aise hi koshish karte rahiye, likhne se hi toh dil halka hota hai.",
    "Bohot khoob. Ek pyara sa vichar:\n'Hausle ke tarkash mein koshish ka woh teer zinda rakho,\nHaar jao chahe sab kuch, par jeetne ki umeed zinda rakho.'",
    "Aapki likhavat me ek pyari si kasak hai. Likhte rahiye, aage badhte rahiye!",
    "Namaste! Mujhe bohot khushi hui aapka sandesh padh kar."
  ],
  admin: [
    "Greetings! I am the platform assistant. Your messages are private and secured. Let me know if you face any issues with content reporting or profile setup.",
    "Support ticket noted. Our moderation team keeps the environment clean and respectful.",
    "Thanks for reaching out! Be sure to write some posts and test the visualizer download functions!"
  ]
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-500">Loading chat rooms...</div>}>
      <ChatView />
    </Suspense>
  );
}

function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { themeStyles } = useMoodTheme();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const initialRecipientName = searchParams.get('recipient');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
        
        // If query param recipient is set, select it by default!
        if (initialRecipientName && data.contacts.length > 0) {
          const matched = data.contacts.find(c => c.username === initialRecipientName);
          if (matched) {
            setSelectedContact(matched);
          }
        } else if (data.contacts.length > 0 && !selectedContact) {
          setSelectedContact(data.contacts[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedContact) return;
    try {
      const res = await fetch(`/api/chat?recipientId=${selectedContact.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [selectedContact]);

  // Scroll to bottom on messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedContact || sending) return;

    const messageText = typedMessage;
    setTypedMessage('');
    
    try {
      setSending(true);
      // Save sent message to DB
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          content: messageText
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Append sent message locally
        setMessages(prev => [...prev, data.message]);

        // Trigger Auto-Reply Simulation for Featured Bots!
        const replyBank = CREATOR_AUTO_REPLIES[selectedContact.username];
        if (replyBank) {
          setTimeout(async () => {
            const randomIndex = Math.floor(Math.random() * replyBank.length);
            const replyText = replyBank[randomIndex];

            // Send reply from bot user back to current user in DB (simulated)
            // Wait, we need to bypass token session to post a message AS the bot.
            // Since we are the server and db is local, we can extend the Chat API or create a simulated post logic.
            // Let's call our route with a mock parameter or just simulate adding it to client messages list,
            // and we can post it. Let's send a post representing the bot directly!
            // Wait, to do this securely, let's create a simulated response POST endpoint or just let the API Route handle bot generation
            // if we pass a special flag or just simulate it directly on the client (which saves DB writes and works instantly)!
            // Actually, inserting it to DB makes it persistent! How?
            // Let's check: can our user POST a message representing someone else? No, that would be insecure.
            // So we will write the simulated message to the local messages list directly so it is interactive and feels alive!
            // Let's add it to the message state list.
            const botMessage = {
              id: Math.random().toString(),
              senderId: selectedContact.id,
              receiverId: user.id,
              content: replyText,
              createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
          }, 1500);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Please log in to join chat rooms.</p>
        <button onClick={() => router.push('/login')} className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="h-[75vh] grid grid-cols-1 md:grid-cols-4 rounded-3xl border bg-black/45 shadow-xl backdrop-blur-md overflow-hidden transition-colors duration-500"
         style={{ borderColor: themeStyles.borderColor }}>
      
      {/* Contact Sidebar */}
      <div className="md:col-span-1 border-r border-white/10 flex flex-col bg-zinc-950/20">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-4.5 w-4.5 text-rose-500" />
            Writers Room
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500">No active writers found.</div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/5 ${
                  selectedContact?.id === contact.id ? 'bg-white/10 text-white font-semibold' : 'text-gray-300'
                }`}
              >
                {contact.profileImage ? (
                  <img src={contact.profileImage} alt={contact.username} className="h-8 w-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                    <User className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs text-white">{contact.name || contact.username}</p>
                  <p className="text-[10px] text-gray-500">@{contact.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="md:col-span-3 flex flex-col h-full bg-black/20 justify-between">
        {selectedContact ? (
          <>
            {/* Active Contact Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/20">
              <div className="flex items-center gap-3">
                {selectedContact.profileImage ? (
                  <img src={selectedContact.profileImage} alt={selectedContact.username} className="h-8 w-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedContact.name || selectedContact.username}</h4>
                  <p className="text-[9px] text-gray-400">@{selectedContact.username}</p>
                </div>
              </div>

              {CREATOR_AUTO_REPLIES[selectedContact.username] && (
                <span className="text-[9px] text-amber-400 px-2 py-0.5 rounded-full border border-amber-900/50 bg-amber-950/25">
                  Simulated Chat Bot Active
                </span>
              )}
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isSelf = message.senderId === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                        isSelf
                          ? 'bg-rose-600 text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <span className="text-[8px] text-white/40 block text-right mt-1.5">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-zinc-950/40">
              <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-full px-4 py-2 focus-within:border-rose-500/50 transition-colors">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder={`Send message to ${selectedContact.name || selectedContact.username}...`}
                  className="flex-grow bg-transparent text-sm text-white focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
            <AlertCircle className="h-8 w-8 text-gray-600" />
            <p className="text-sm">Select a writer contact to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}
