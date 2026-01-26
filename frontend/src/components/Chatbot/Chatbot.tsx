import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import ReactMarkdown from 'react-markdown';
import {
  MessageCircle,
  X,
  Maximize2,
  Minimize2,
  Send,
  Copy,
  User,
  Bot,
  Sparkles,
  HelpCircle,
  BookOpen
} from 'lucide-react';

const preQuestions = [
  "How do I register for an exam on ExamWizards?",
  "How can I reset my password?",
  "Where can I see my exam results?",
  "How do instructors create and manage exams?",
  "What analytics are available for administrators?",
  "How do I enroll in courses?",
  "How do I contact support?",
  "What payment options are available?"
];

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, fullscreen, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSend = async (customInput?: string) => {
    const question = typeof customInput === 'string' ? customInput : input;
    if (!question.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      sender: 'user',
      text: question,
      timestamp: new Date()
    };

    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);
    setTyping(true);

    try {
      const res = await apiService.askChatbot(question);
      const botMessageId = generateId();
      const fullText = res.answer || 'I apologize, but I couldn\'t generate a response. Please try again.';

      // Create initial bot message
      const botMessage: Message = {
        id: botMessageId,
        sender: 'bot',
        text: '',
        timestamp: new Date()
      };

      setMessages(msgs => [...msgs, botMessage]);

      // Simulate typing effect
      let i = 0;
      let botText = '';
      const typeInterval = setInterval(() => {
        botText += fullText[i];
        setMessages(msgs => {
          const newMsgs = [...msgs];
          const lastMsgIndex = newMsgs.length - 1;
          if (newMsgs[lastMsgIndex]?.id === botMessageId) {
            newMsgs[lastMsgIndex] = { ...newMsgs[lastMsgIndex], text: botText };
          }
          return newMsgs;
        });
        i++;
        if (i >= fullText.length) {
          clearInterval(typeInterval);
          setTyping(false);
        }
      }, 15 + Math.random() * 25);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or contact support at 1234567890.',
        timestamp: new Date()
      };
      setMessages((msgs) => [...msgs, errorMessage]);
      setTyping(false);
    }
    setLoading(false);
  };

  // Copy to clipboard for bot answers
  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      {/* Floating Chatbot Button */}
      {!open && (
        <button
          aria-label="Open ExamWizards Assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center group transform hover:scale-110"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chatbot Interface */}
      {open && (
        <div
          className={`fixed z-50 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl transition-all duration-500 ease-out ${fullscreen
              ? 'inset-0 rounded-none'
              : 'bottom-6 right-6 w-96 h-[600px] rounded-2xl animate-slideUp'
            }`}
          style={{
            maxWidth: fullscreen ? '100vw' : '400px',
            maxHeight: fullscreen ? '100vh' : '600px',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg">ExamWizards Assistant</h3>
                <p className="text-xs text-purple-100 opacity-90">
                  {typing ? 'Typing...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={fullscreen ? 'Minimize' : 'Maximize'}
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setOpen(false); setFullscreen(false); }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-0" style={{ height: fullscreen ? 'calc(100vh - 140px)' : '460px' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Welcome to ExamWizards!</h4>
                <p className="text-gray-600 mb-6 text-sm">I'm here to help you with any questions about our platform.</p>

                <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                  {preQuestions.slice(0, 6).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(question)}
                      className="text-left p-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-purple-700 shadow-sm hover:shadow-md"
                    >
                      <span className="text-purple-500 mr-2">•</span>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 animate-fadeIn ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                  }`}>
                  {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-xs ${message.sender === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block p-3 rounded-2xl shadow-sm ${message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}
                  >
                    {message.sender === 'bot' ? (
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 text-purple-700" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2 text-purple-600" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-1 text-purple-500" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-300 pl-3 italic text-gray-600 my-2" {...props} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.sender === 'bot' && message.text && (
                      <button
                        onClick={() => handleCopy(message.text, message.id)}
                        className="hover:text-purple-600 transition-colors p-1 hover:bg-purple-50 rounded"
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <span className="text-green-600 text-xs">Copied!</span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex items-start space-x-3 animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask me anything about ExamWizards..."
                disabled={loading}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Send message"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Powered by ExamWizards AI
            </p>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .chatbot-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;