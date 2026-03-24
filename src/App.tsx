import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, Send, Menu, MessageSquare, X, Image as ImageIcon, FileText, Camera, Loader2, Trash2, Play, CheckCircle, Award, ChevronLeft, Info, Calculator, PenTool, Zap, BookOpen, Star, Search } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `أنت Aqeel Ai، مساعد ذكي مخصص للدراسة والتعليم. يجب عليك الالتزام بالتعليمات التالية بدقة:
1. تحدث باللهجة العراقية المفهومة والواضحة.
2. استخدم أسلوب الشرح التدريجي (خطوة بخطوة) للمسائل الرياضية أو العلمية.
3. استخدم قوالب التصميم الجاهزة التالية لتنظيم المحتوى:
   - للفصول والمواضيع الرئيسية استخدم (Heading 1): \`# 📚 الفصل الأول: اسم الفصل\`
   - للأقسام والمواضيع الفرعية استخدم (Heading 2): \`## 📌 اسم القسم\`
   - للأجزاء والنقاط التفصيلية استخدم (Heading 3): \`### اسم الجزء\`
   - للملاحظات، التعاريف، والقواعد الهامة استخدم الاقتباس (Blockquote): \`> 💡 **ملاحظة هامة:** الشرح هنا...\`
4. استخدم قوائم التعداد (النقطية والرقمية) لتنظيم المعلومات.
5. استخدم السمايلات (Emojis) بشكل مناسب للموضوع لكسر الملل.
6. استخدم خانات للأكواد البرمجية عند الحاجة.
7. استخدم جداول احترافية لعرض البيانات والمقارنات.
8. استخدم خانات للمعادلات الرياضية بصيغة LaTeX (بين $ أو $$). **هام جداً:** لجميع الكسور والمعدلات، استخدم دائماً صيغة البسط والمقام \`\\displaystyle \\frac{a}{b}\` ولا تستخدم علامة القسمة المائلة (/) أبداً.
9. لإنشاء اختبار تفاعلي (MCQ) شامل يغطي كل تفاصيل الشرح في نهاية الدرس، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم mcq. يجب أن يحتوي الاختبار على عدة أسئلة شاملة داخل مصفوفة (Array):
\`\`\`mcq
[
  {
    "question": "نص السؤال الأول هنا؟",
    "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
    "correctAnswerIndex": 0,
    "explanation": "شرح سبب الإجابة الصحيحة أو الخاطئة هنا."
  }
]
\`\`\`
(تأكد من أن correctAnswerIndex يبدأ من 0 وهو رقم صحيح).
10. توقف عن الكتابة عندما يكتمل الجواب ويكون مفهوماً، لا تضف حشواً مملاً.
11. **المرونة في الرد (مهم جداً):** إذا كان المستخدم يلقي التحية أو يريد الدردشة العادية (مثل "شلونك"، "اريد اسولف")، فرد عليه بشكل طبيعي، قصير، وبسيط جداً كصديق، ولا تستخدم قوالب الدروس أو الاختبارات (MCQ). استخدم القوالب والشرح المفصل **فقط** عندما يسأل عن موضوع دراسي أو علمي.
12. استخدم الأسهم (➔، →، ←، ➡️، ⬅️، ⬇️، ⬆️) لتوضيح الخطوات والعمليات والاتجاهات، حيث ستظهر بلون بنفسجي مميز.
13. لإنشاء صندوق القاعدة (يظهر في منتصف الشاشة)، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم rule:
\`\`\`rule
{
  "rule": "نص القاعدة أو المعادلة هنا"
}
\`\`\``;

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: { data: string; mimeType: string; name: string }[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

// Rule Card Component
const RuleCard = ({ content }: { content: string }) => {
  let ruleData: any = null;
  try {
    ruleData = JSON.parse(content);
  } catch (e) {
    return null;
  }

  if (!ruleData) return null;
  
  const displayContent = ruleData.rule || ruleData.formula || ruleData.content;
  if (!displayContent) return null;

  return (
    <div className="my-4 w-full flex justify-center px-2">
      <div className="bg-[#050505] border border-[#A8A3F8]/40 rounded-xl px-6 py-5 w-full max-w-lg flex items-center justify-center shadow-lg shadow-[#A8A3F8]/5">
        <span className="text-[#A8A3F8] font-mono text-lg md:text-2xl font-bold whitespace-pre-wrap text-center leading-relaxed tracking-tight" dir="auto">
          {displayContent}
        </span>
      </div>
    </div>
  );
};

// Interactive MCQ Component
const InteractiveMCQ = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  let questions: any[] = [];
  try {
    const parsed = JSON.parse(content);
    questions = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return (
      <div className="my-4 bg-[#050505] border border-[#A8A3F8]/20 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A8A3F8]/5 to-transparent animate-pulse"></div>
        <Star size={40} className="text-[#A8A3F8] animate-[spin_3s_linear_infinite] mb-4 fill-[#A8A3F8]/20" />
        <span className="text-base font-bold text-[#A8A3F8] z-10">جاري إنشاء اختبار شامل للدرس...</span>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !questions[0].question) {
     return <div className="text-red-400 my-4">⚠️ بيانات الاختبار التفاعلي غير مكتملة.</div>;
  }

  const handleSelect = (idx: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const score = Object.keys(selectedAnswers).reduce((acc, key) => {
    const qIdx = parseInt(key);
    if (selectedAnswers[qIdx] === questions[qIdx].correctAnswerIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsFinished(false);
  };

  if (!isOpen) {
    return (
      <div className="my-4 flex justify-center md:justify-start">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-3 w-full md:w-auto bg-gradient-to-r from-[#A8A3F8] to-[#8b85f0] text-[#050505] px-6 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#A8A3F8]/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play size={24} className="fill-current" />
          <span className="text-lg">بدء الاختبار ({questions.length} أسئلة)</span>
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;
  const selectedIdx = selectedAnswers[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
      {/* Floating Close Button */}
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute top-6 right-6 z-[60] p-3 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all backdrop-blur-sm border border-white/10"
      >
        <X size={28} />
      </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl">
          {!isFinished ? (
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
                <div 
                  className="h-full bg-[#A8A3F8] transition-all duration-500 ease-out" 
                  style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <h3 
                className="text-xl md:text-3xl font-bold text-white mb-8 mt-2 leading-relaxed text-start break-words whitespace-pre-wrap w-full"
                dir="auto"
              >
                {currentQ.question}
              </h3>

              <div className="space-y-4">
                {currentQ.options.map((opt: string, idx: number) => {
                  let btnClass = "w-full text-start p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group flex items-center gap-4 ";
                  
                  if (!hasAnsweredCurrent) {
                    btnClass += "border-white/5 hover:border-[#A8A3F8]/50 hover:bg-[#A8A3F8]/5 bg-[#1A1A1A] text-neutral-200 cursor-pointer";
                  } else {
                    btnClass += "cursor-default ";
                    if (idx === currentQ.correctAnswerIndex) {
                      btnClass += "border-white/20 bg-[#1A1A1A] text-white font-bold";
                    } else if (idx === selectedIdx) {
                      btnClass += "border-white/10 bg-[#1A1A1A] text-neutral-400 line-through opacity-70";
                    } else {
                      btnClass += "border-white/5 bg-[#1A1A1A] text-neutral-500 opacity-40";
                    }
                  }

                  return (
                    <button 
                      key={idx} 
                      onClick={() => handleSelect(idx)}
                      disabled={hasAnsweredCurrent}
                      className={btnClass}
                      dir="auto"
                    >
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300
                        ${!hasAnsweredCurrent ? 'border-neutral-600 group-hover:border-[#A8A3F8]' : 
                          idx === currentQ.correctAnswerIndex ? 'border-[#A8A3F8] bg-[#A8A3F8]/20' : 
                          idx === selectedIdx ? 'border-[#A8A3F8] bg-[#A8A3F8]/20' : 'border-neutral-700'
                        }
                      `}>
                        {hasAnsweredCurrent && idx === currentQ.correctAnswerIndex && <span className="text-[#A8A3F8] text-xs md:text-base font-bold">✓</span>}
                        {hasAnsweredCurrent && idx === selectedIdx && idx !== currentQ.correctAnswerIndex && <span className="text-[#A8A3F8] text-xs md:text-base font-bold">✗</span>}
                      </div>
                      <span className="text-base md:text-lg leading-snug flex-1 text-start break-words whitespace-pre-wrap min-w-0">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {hasAnsweredCurrent && (
                <div className="mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-full">
                  <div className="flex flex-col gap-4 w-full">
                    {/* Professional Explanation Box */}
                    <div className="relative bg-gradient-to-br from-[#1A1A24] to-[#111118] border border-[#A8A3F8]/20 rounded-2xl p-4 md:p-6 shadow-xl overflow-hidden group w-full">
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#A8A3F8] to-[#7C77E0]"></div>
                      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#A8A3F8]/5 rounded-full blur-2xl group-hover:bg-[#A8A3F8]/10 transition-all duration-500"></div>
                      
                      <div className="relative flex items-start gap-3 md:gap-4 w-full">
                        <div className="bg-[#A8A3F8]/10 p-2.5 md:p-3 rounded-xl shrink-0 border border-[#A8A3F8]/20">
                          <Info size={20} className="text-[#A8A3F8] md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#A8A3F8] font-bold text-base md:text-lg mb-1.5 md:mb-2">
                            التوضيح
                          </h4>
                          <p 
                            className="text-neutral-300 text-sm md:text-lg leading-relaxed break-words whitespace-pre-wrap text-start"
                            dir="auto"
                          >
                            {currentQ.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    className="w-full mt-6 bg-[#A8A3F8] text-black font-bold text-lg p-4 rounded-xl hover:bg-[#918cf2] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#A8A3F8]/20"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>السؤال التالي <ChevronLeft size={20} /></>
                    ) : (
                      <>عرض النتيجة <Award size={20} /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-[#A8A3F8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={48} className="text-[#A8A3F8]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">اكتمل الاختبار!</h2>
              <p className="text-neutral-400 text-lg mb-8">لقد أجبت على {questions.length} أسئلة.</p>
              
              <div className="flex justify-center items-center gap-8 mb-10">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">{score}</div>
                  <div className="text-neutral-500 font-medium">إجابة صحيحة</div>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-red-400 mb-2">{questions.length - score}</div>
                  <div className="text-neutral-500 font-medium">إجابة خاطئة</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={resetQuiz}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                >
                  إعادة الاختبار
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-4 bg-[#A8A3F8] hover:bg-[#918cf2] text-black rounded-xl font-bold transition-colors shadow-lg shadow-[#A8A3F8]/20"
                >
                  العودة للمحادثة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import rehypeRaw from 'rehype-raw';

const preprocessContent = (content: string) => {
  // Split by code blocks to avoid replacing inside them
  const parts = content.split(/(```[\s\S]*?```)/g);
  const arrowRegex = /(➔|→|←|⬅️|➡️|⬆️|⬇️)/g;
  
  const processedParts = parts.map(part => {
    if (part.startsWith('```')) return part;
    return part.replace(arrowRegex, '<span class="text-[#A8A3F8] font-bold mx-1">$1</span>');
  });
  
  let processed = processedParts.join('');

  const mcqRegex = /```mcq\n([\s\S]*?)```/g;
  let match;
  const questions: any[] = [];
  const matches: { index: number, length: number, content: string }[] = [];

  while ((match = mcqRegex.exec(processed)) !== null) {
    matches.push({ index: match.index, length: match[0].length, content: match[1] });
  }

  if (matches.length > 1) {
    for (const m of matches) {
      try {
        const parsed = JSON.parse(m.content);
        if (Array.isArray(parsed)) {
          questions.push(...parsed);
        } else {
          questions.push(parsed);
        }
      } catch (e) {
        // ignore
      }
    }

    if (questions.length > 0) {
      let newContent = processed;
      for (let i = matches.length - 1; i > 0; i--) {
        const m = matches[i];
        newContent = newContent.substring(0, m.index) + newContent.substring(m.index + m.length);
      }
      const firstMatch = matches[0];
      const mergedBlock = `\`\`\`mcq\n${JSON.stringify(questions, null, 2)}\n\`\`\``;
      newContent = newContent.substring(0, firstMatch.index) + mergedBlock + newContent.substring(firstMatch.index + firstMatch.length);
      return newContent;
    }
  }

  return processed;
};

const MarkdownComponents: any = {
  pre({ children }: any) {
    return <>{children}</>;
  },
  p({ children }: any) {
    return <div className="mb-4 last:mb-0">{children}</div>;
  },
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match && match[1] === 'mcq') {
      return <InteractiveMCQ content={String(children).replace(/\n$/, '')} />;
    }
    if (!inline && match && match[1] === 'rule') {
      return <RuleCard content={String(children).replace(/\n$/, '')} />;
    }
    return !inline ? (
      <div className="bg-[#111111] p-4 rounded-xl overflow-x-auto my-4 border border-white/10 text-sm md:text-base font-mono" dir="ltr">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const getSearchSnippet = (chat: Chat) => {
    if (!searchQuery) return null;
    const query = searchQuery.toLowerCase();
    const matchingMessage = chat.messages.find(m => m.content.toLowerCase().includes(query));
    if (!matchingMessage) return null;
    
    const content = matchingMessage.content;
    const index = content.toLowerCase().indexOf(query);
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + query.length + 40);
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    return snippet;
  };

  const [sidebarDragX, setSidebarDragX] = useState<number | null>(null);
  const sidebarWidth = 280;
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aqeel_ai_chats_v2');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aqeel_ai_current_chat_id_v2');
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-pro-preview');
  const [zoomLevel, setZoomLevel] = useState(70);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(70);
  const zoomTimeout = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Update mobile zoom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--mobile-zoom', (zoomLevel / 100).toString());
      
      // Show indicator
      setShowZoomIndicator(true);
      if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
      zoomTimeout.current = setTimeout(() => setShowZoomIndicator(false), 1500);
    }
  }, [zoomLevel]);

  // Swipe to open/close sidebar with dragging
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontalSwipe = false;
      
      // Only start drag if sidebar is open OR if starting from the right edge
      if (!isSidebarOpen && startX < window.innerWidth - 60) {
        startX = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !startX) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const diffX = Math.abs(startX - currentX);
      const diffY = Math.abs(startY - currentY);

      if (!isHorizontalSwipe && diffX > 10 && diffX > diffY) {
        isHorizontalSwipe = true;
      }

      if (isHorizontalSwipe) {
        if (e.cancelable) e.preventDefault();
        if (isSidebarOpen) {
          // Closing: dragging from left to right
          const drag = Math.max(0, Math.min(sidebarWidth, currentX - startX));
          setSidebarDragX(drag);
        } else {
          // Opening: dragging from right to left
          const drag = Math.max(0, Math.min(sidebarWidth, sidebarWidth - (startX - currentX)));
          setSidebarDragX(drag);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX) return;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      const threshold = 100;

      if (isHorizontalSwipe) {
        if (isSidebarOpen) {
          // If dragged more than threshold to the right, close it
          if (endX - startX > threshold) {
            setIsSidebarOpen(false);
          }
        } else {
          // If dragged more than threshold to the left, open it
          if (startX - endX > threshold) {
            setIsSidebarOpen(true);
          }
        }
      }
      
      setSidebarDragX(null);
      startX = 0;
      startY = 0;
      isHorizontalSwipe = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarOpen]);

  // Pinch to zoom gesture
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevent browser zoom
        const distance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        initialPinchDistance.current = distance;
        initialZoom.current = zoomLevel;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance.current !== null) {
        e.preventDefault(); // Prevent browser zoom
        const currentDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        
        const delta = currentDistance / initialPinchDistance.current;
        const newZoom = Math.round(initialZoom.current * delta);
        
        // Clamp between 50 and 80
        setZoomLevel(Math.min(80, Math.max(50, newZoom)));
      }
    };

    const handleTouchEnd = () => {
      initialPinchDistance.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomLevel]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Scroll to bottom
  useLayoutEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 10000000;
    }
  }, [messages, currentChatId]);

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClick = () => setIsAttachmentOpen(false);
    if (isAttachmentOpen) {
      window.addEventListener('click', handleClick);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [isAttachmentOpen]);

  // Persistent storage
  useEffect(() => {
    localStorage.setItem('aqeel_ai_chats_v2', JSON.stringify(chats));
    if (currentChatId) {
      localStorage.setItem('aqeel_ai_current_chat_id_v2', currentChatId);
    } else {
      localStorage.removeItem('aqeel_ai_current_chat_id_v2');
    }
  }, [chats, currentChatId]);

  // Load current chat messages when switching chats
  useLayoutEffect(() => {
    if (currentChatId) {
      const activeChat = chats.find(c => c.id === currentChatId);
      if (activeChat) {
        setMessages(activeChat.messages);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId]); // Only run when currentChatId changes

  // Sync current messages back to the chats array for persistence
  // Use a ref to avoid infinite loops and only sync when messages actually change
  const lastSyncedMessagesRef = useRef<string>('');

  useEffect(() => {
    if (currentChatId && messages.length > 0 && !isLoading) {
      const messagesString = JSON.stringify(messages);
      if (lastSyncedMessagesRef.current === messagesString) return;
      
      lastSyncedMessagesRef.current = messagesString;

      setChats(prev => {
        const chatIndex = prev.findIndex(c => c.id === currentChatId);
        if (chatIndex === -1) return prev;
        
        const updated = [...prev];
        updated[chatIndex] = { 
          ...updated[chatIndex], 
          messages: messages,
          timestamp: Date.now() 
        };
        return updated;
      });
    }
  }, [messages, currentChatId, isLoading]);

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setMessage('');
    setAttachments([]);
    setIsSidebarOpen(false);
  };

  const switchChat = (id: string) => {
    setCurrentChatId(id);
    const activeChat = chats.find(c => c.id === id);
    if (activeChat) {
      setMessages(activeChat.messages);
    } else {
      setMessages([]);
    }
    setIsSidebarOpen(false);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          data: base64String,
          mimeType: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (e.target) e.target.value = '';
    setIsAttachmentOpen(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      attachments: [...attachments]
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Create Chat in history if it doesn't exist
    let activeId = currentChatId;
    if (!activeId) {
      activeId = Date.now().toString();
      const newChat: Chat = {
        id: activeId,
        title: message.substring(0, 30) || 'محادثة جديدة',
        messages: newMessages,
        timestamp: Date.now()
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(activeId);
    }

    setMessage('');
    setAttachments([]);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Prepare current message parts
      const currentParts: any[] = [];
      if (userMessage.attachments) {
        userMessage.attachments.forEach(att => {
          currentParts.push({
            inlineData: {
              data: att.data,
              mimeType: att.mimeType
            }
          });
        });
      }
      if (userMessage.content) {
        currentParts.push({ text: userMessage.content });
      }

      const validMessages = messages.filter(msg => !msg.content.startsWith('❌ عذراً'));
      const contents: any[] = [];
      let lastRole = '';

      validMessages.forEach(msg => {
        const parts: any[] = [];
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(att => {
            parts.push({
              inlineData: { data: att.data, mimeType: att.mimeType }
            });
          });
        }
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (parts.length === 0) parts.push({ text: ' ' });

        if (msg.role === lastRole) {
          contents[contents.length - 1].parts.push(...parts);
        } else {
          contents.push({ role: msg.role, parts });
          lastRole = msg.role;
        }
      });

      if (lastRole === 'user') {
        contents[contents.length - 1].parts.push(...currentParts);
      } else {
        contents.push({
          role: 'user',
          parts: currentParts
        });
      }

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'model', content: '' }]);

      let fullText = '';
      let currentDisplayedText = '';
      let isStreamComplete = false;

      const typeInterval = setInterval(() => {
        if (currentDisplayedText.length < fullText.length) {
          const diff = fullText.length - currentDisplayedText.length;
          const charsToAdd = Math.max(1, Math.ceil(diff / 3)); 
          currentDisplayedText += fullText.substring(currentDisplayedText.length, currentDisplayedText.length + charsToAdd);
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: currentDisplayedText }
              : msg
          ));
        } else if (isStreamComplete) {
          clearInterval(typeInterval);
        }
      }, 15);

      for await (const chunk of responseStream) {
        fullText += chunk.text || '';
      }
      isStreamComplete = true;

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: '❌ عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div dir="rtl" className="flex h-full bg-[#050505] text-white font-sans overflow-hidden selection:bg-[#A8A3F8]/30">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        onChange={handleFileSelect}
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
        onChange={handleFileSelect}
      />

      {/* Sidebar Overlay for Mobile */}
      {(isSidebarOpen || sidebarDragX !== null) && (
        <div 
          className="fixed inset-0 bg-black z-40 md:hidden transition-opacity"
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${sidebarDragX !== null ? (0.4 * (1 - sidebarDragX / sidebarWidth)) : 0.4})`,
            transition: sidebarDragX !== null ? 'none' : 'background-color 150ms ease-in-out'
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:static inset-y-0 right-0 z-50 w-[280px] bg-[#111111] transform transition-transform duration-150 ease-in-out
          ${sidebarDragX !== null ? '' : (isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0')}
          flex flex-col border-l border-white/5
        `}
        style={sidebarDragX !== null ? { transform: `translateX(${sidebarDragX}px)`, transition: 'none' } : {}}
      >
        <div className="hidden md:flex p-4 justify-between items-center border-b border-white/5">
          <h2 className="text-lg font-semibold text-neutral-200">السجل</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text"
              placeholder="بحث في السجل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-10 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#A8A3F8]/30 transition-all"
              dir="rtl"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.filter(chat => 
            chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
          ).length > 0 ? (
            chats
              .filter(chat => 
                chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((chat) => {
                const snippet = getSearchSnippet(chat);
                return (
                  <div key={chat.id} className="relative group">
                    <button 
                      onClick={() => switchChat(chat.id)}
                      className={`w-full text-right p-3 rounded-xl transition-all flex items-start gap-3 group/btn
                        ${currentChatId === chat.id 
                          ? 'bg-[#A8A3F8]/10 border border-[#A8A3F8]/20 text-[#A8A3F8]' 
                          : 'hover:bg-white/5 text-neutral-400 hover:text-neutral-200 border border-transparent'}
                      `}
                    >
                      <MessageSquare size={18} className={`mt-0.5 ${currentChatId === chat.id ? 'text-[#A8A3F8]' : 'text-neutral-500 group-hover/btn:text-[#A8A3F8]'}`} />
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{chat.title}</span>
                        {snippet && (
                          <span className="truncate text-[10px] opacity-60 font-normal text-neutral-400" dir="auto">
                            {snippet}
                          </span>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={(e) => deleteChat(e, chat.id)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-10 text-neutral-500 text-sm">
              {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد محادثات سابقة'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col relative min-w-0 transition-transform duration-150 ease-in-out ${sidebarDragX !== null ? '' : (isSidebarOpen ? '-translate-x-[280px] md:translate-x-0' : 'translate-x-0')}`}
        style={sidebarDragX !== null ? { transform: `translateX(-${sidebarWidth - sidebarDragX}px)`, transition: 'none' } : {}}
      >
        {/* Zoom Indicator */}
        {showZoomIndicator && (
          <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/80 backdrop-blur-md border border-[#A8A3F8]/30 px-4 py-2 rounded-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <span className="text-[#A8A3F8] font-bold text-sm">
              الزوم: {zoomLevel}%
            </span>
          </div>
        )}

        {/* Header Controls */}
        <div className="absolute top-0 right-0 p-4 z-10 flex items-center gap-2">
          {/* Model Selector */}
          <div className="flex items-center gap-1 bg-[#050505]/80 backdrop-blur-sm border border-white/5 rounded-lg p-1 shadow-lg">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#A8A3F8] outline-none cursor-pointer px-2 py-1"
              dir="ltr"
            >
              <option value="gemini-3.1-pro-preview">Pro</option>
              <option value="gemini-3.1-flash-preview">Flash</option>
              <option value="gemini-3.1-flash-lite-preview">Lite</option>
            </select>
          </div>

          <button 
            onClick={startNewChat}
            className="text-neutral-400 hover:text-[#A8A3F8] transition-colors p-2 rounded-lg hover:bg-white/5 bg-[#050505]/80 backdrop-blur-sm border border-white/5 shadow-lg"
            title="محادثة جديدة"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 bg-[#050505]/80 backdrop-blur-sm border border-white/5 shadow-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          key={currentChatId || 'new'}
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-40"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center content-zoom">
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  اهلا بك في <span className="text-[#A8A3F8]">Aqeel Ai</span>
                </h1>
                <p className="text-neutral-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                  مساعدك الذكي المخصص للدراسة.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 content-zoom">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'bg-[#222222] text-white px-5 py-4 rounded-2xl rounded-tr-sm' : 'text-neutral-200 w-full'}`}>
                    
                    {/* Attachments Display */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          att.mimeType.startsWith('image/') ? (
                            <img key={i} src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-32 h-32 object-cover rounded-lg border border-white/10" />
                          ) : (
                            <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                              <FileText size={16} className="text-[#A8A3F8]" />
                              <span className="text-sm truncate max-w-[150px]">{att.name}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Message Content */}
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap text-lg text-start" dir="auto">{msg.content}</div>
                    ) : (
                      <div className="markdown-body relative">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                          components={MarkdownComponents}
                        >
                          {preprocessContent(msg.content)}
                        </ReactMarkdown>
                        {isLoading && msg.id === messages[messages.length - 1]?.id && (
                          <span className="inline-block w-2 h-5 bg-[#A8A3F8] animate-pulse ml-1 align-middle mt-1"></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-start">
                  <div className="text-neutral-400 flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin text-[#A8A3F8]" />
                    <span>Aqeel Ai يكتب...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 bg-[#1A1A1A] p-3 rounded-2xl border border-white/10">
                {attachments.map((att, index) => (
                  <div key={index} className="relative group">
                    {att.mimeType.startsWith('image/') ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-white/20" />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-lg border border-white/20">
                        <FileText size={24} className="text-[#A8A3F8]" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attachment Menu */}
            {isAttachmentOpen && (
              <div 
                className="absolute bottom-[calc(100%+12px)] right-0 bg-[#1A1A1A] rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col gap-1 w-56 z-20 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-right transition-colors text-sm text-neutral-200">
                  <div className="bg-[#A8A3F8]/10 p-2 rounded-lg">
                    <ImageIcon size={18} className="text-[#A8A3F8]" />
                  </div>
                  <span className="font-medium">إرفاق صورة</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-right transition-colors text-sm text-neutral-200">
                  <div className="bg-[#A8A3F8]/10 p-2 rounded-lg">
                    <FileText size={18} className="text-[#A8A3F8]" />
                  </div>
                  <span className="font-medium">إرفاق ملف</span>
                </button>
                <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-right transition-colors text-sm text-neutral-200">
                  <div className="bg-[#A8A3F8]/10 p-2 rounded-lg">
                    <Camera size={18} className="text-[#A8A3F8]" />
                  </div>
                  <span className="font-medium">فتح الكاميرا</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="bg-[#1A1A1A] rounded-[24px] flex items-end p-2 shadow-lg transition-all duration-300 focus-within:bg-[#222222] focus-within:ring-1 focus-within:ring-white/10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAttachmentOpen(!isAttachmentOpen);
                }}
                className="p-3 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/5 flex-shrink-0 mb-0.5"
              >
                <Plus size={24} className={isAttachmentOpen ? "rotate-45 transition-transform duration-200" : "transition-transform duration-200"} />
              </button>
              
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسأل Aqeel Ai عن أي موضوع دراسي..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 resize-none max-h-[200px] min-h-[44px] py-3 px-2 outline-none text-base leading-relaxed"
                rows={1}
                dir="auto"
                style={{ overflowY: message.split('\n').length > 5 ? 'auto' : 'hidden' }}
              />
              
              <button 
                onClick={handleSend}
                disabled={(!message.trim() && attachments.length === 0) || isLoading}
                className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 mb-0.5 ${(message.trim() || attachments.length > 0) && !isLoading ? 'text-[#050505] bg-[#A8A3F8] hover:bg-[#958df5] scale-100' : 'text-neutral-600 bg-transparent scale-95 cursor-not-allowed'}`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="rtl:-scale-x-100" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
