import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, Send, Menu, X, Image as ImageIcon, FileText, Camera, Loader2, Trash2, Play, CheckCircle, Award, ChevronLeft, ChevronRight, Info, Calculator, PenTool, Zap, BookOpen, Star, Search, WifiOff, Layers, Check, RotateCcw, Database, Headphones, Link as LinkIcon, Youtube, Type, Globe, MoreVertical, Pin, Edit2, ArrowUp, Eye, Printer, Download, Save, PenLine } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

// Initialize Gemini safely
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will be limited.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};
const ai = getAI();

const SYSTEM_INSTRUCTION = `أنت KLYVON، مساعد ذكي مخصص للدراسة والتعليم. يجب عليك الالتزام بالتعليمات التالية بدقة:
1. قم بإعادة صياغة وشرح محتوى الدرس بطريقة تبدأ من المستوى الصفر، واستهدف شخصًا لا يملك أي خلفية مسبقة عن الموضوع.
2. استخدم أبسط الكلمات والأمثلة اليومية، وتجنب المصطلحات التقنية أو اشرحها باستخدام تشبيهات مألوفة (مثل شرح مفهوم "الشبكة العصبية" بأنها "طريقة تفكير مثل الدماغ لكن داخل الحاسوب").
3. تأكد من أن الشرح يصل حتى لو كان المستمع شخصًا من العصر الحجري، مع تقديم خطوات منطقية تبدأ من المفاهيم الأساسية وتتدرج تدريجيًا حتى تصل للفكرة المعقدة.
4. اختتم كل جزء بتلخيص بسيط واختبار فهم سريع يضمن أن المفهوم قد وصل بالكامل.
5. تحدث بلهجة مفهومة وواضحة (يمكنك استخدام اللهجة العراقية البسيطة أو الفصحى المبسطة).
6. استخدم قوالب التصميم الجاهزة التالية لتنظيم المحتوى:
   - للفصول والمواضيع الرئيسية استخدم (Heading 1): \`# 📚 الفصل الأول: اسم الفصل\`
   - للأقسام والمواضيع الفرعية استخدم (Heading 2): \`## 📌 اسم القسم\`
   - للأجزاء والنقاط التفصيلية استخدم (Heading 3): \`### اسم الجزء\`
   - للملاحظات، التعاريف، والقواعد الهامة استخدم الاقتباس (Blockquote): \`> 💡 **ملاحظة هامة:** الشرح هنا...\`
7. استخدم قوائم التعداد (النقطية والرقمية) لتنظيم المعلومات.
8. استخدم السمايلات (Emojis) بشكل مناسب للموضوع لكسر الملل.
9. استخدم خانات للأكواد البرمجية عند الحاجة.
10. استخدم جداول احترافية لعرض البيانات والمقارنات.
11. استخدم خانات للمعادلات الرياضية بصيغة LaTeX (بين $ أو $$). **هام جداً:** لجميع الكسور والمعدلات، استخدم دائماً صيغة البسط والمقام \`\\displaystyle \\frac{a}{b}\` ولا تستخدم علامة القسمة المائلة (/) أبداً.
12. لإنشاء اختبار تفاعلي (MCQ) شامل يغطي كل تفاصيل الشرح في نهاية الدرس (أو كاختبار فهم سريع في نهاية كل جزء)، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم mcq. يجب أن يحتوي الاختبار على عدة أسئلة شاملة داخل مصفوفة (Array):
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
13. توقف عن الكتابة عندما يكتمل الجواب ويكون مفهوماً، لا تضف حشواً مملاً.
14. **المرونة في الرد (مهم جداً):** إذا كان المستخدم يلقي التحية أو يريد الدردشة العادية (مثل "شلونك"، "اريد اسولف")، فرد عليه بشكل طبيعي، قصير، وبسيط جداً كصديق، ولا تستخدم قوالب الدروس أو الاختبارات (MCQ). استخدم القوالب والشرح المفصل **فقط** عندما يسأل عن موضوع دراسي أو علمي.
15. استخدم الأسهم (➔، →، ←، ➡️، ⬅️، ⬇️، ⬆️) لتوضيح الخطوات والعمليات والاتجاهات، حيث ستظهر بلون بنفسجي مميز.
16. لإنشاء صندوق القاعدة (يظهر في منتصف الشاشة)، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم rule:
\`\`\`rule
{
  "rule": "نص القاعدة أو المعادلة هنا"
}
\`\`\`
17. لإنشاء مثال أو تمرين تفاعلي مع زر لإظهار/إخفاء الحل بخطوات مفصلة، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم example:
\`\`\`example
{
  "question": "نص السؤال أو التمرين هنا",
  "steps": [
    {
      "step": "الخطوة الأولى من الحل (يمكن أن تحتوي على معادلات)",
      "explanation": "شرح تفصيلي لكيفية الوصول لهذه الخطوة ولماذا قمنا بها"
    },
    {
      "step": "الخطوة الثانية...",
      "explanation": "شرح الخطوة الثانية..."
    }
  ]
}
\`\`\`
18. لإنشاء مثلث القوانين (مثل قانون أوم أو المتسعة)، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم triangle:
\`\`\`triangle
{
  "top": { "symbol": "V", "label": "الجهد" },
  "left": { "symbol": "R", "label": "المقاومة" },
  "right": { "symbol": "I", "label": "التيار" }
}
\`\`\`
(تأكد من استخدام الرموز والأسماء الصحيحة للقانون المطلوب).
19. لإنشاء بطاقات تعليمية (Flashcards) للمراجعة والحفظ، استخدم **فقط** هذا القالب البرمجي بصيغة JSON داخل كود بلوك باسم flashcards:
\`\`\`flashcards
{
  "title": "عنوان مجموعة البطاقات (مثال: مراجعة الفصل الأول)",
  "cards": [
    { "q": "السؤال أو المصطلح هنا", "a": "الإجابة أو التعريف هنا" },
    { "q": "سؤال آخر", "a": "إجابة أخرى" }
  ]
}
\`\`\`
`;

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: { data: string; mimeType: string; name: string }[];
}

type SourceType = 'pdf' | 'audio' | 'url' | 'youtube' | 'text' | 'web_search';

interface Source {
  id: string;
  type: SourceType;
  name: string;
  content?: string;
  file?: { data: string; mimeType: string; name: string };
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  sources?: Source[];
  isSourceMode?: boolean;
  pinned?: boolean;
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

// Formula Triangle Component
const FormulaTriangle = ({ content }: { content: string }) => {
  let data: any = null;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return null;
  }

  if (!data || !data.top || !data.left || !data.right) return null;

  return (
    <div className="my-8 w-full flex justify-center px-4">
      <div className="relative w-full max-w-[320px] aspect-[1.15/1] flex flex-col items-center">
        {/* The Triangle SVG */}
        <svg viewBox="0 0 100 86.6" className="w-full h-full drop-shadow-2xl">
          <path 
            d="M50 2 L98 84.6 L2 84.6 Z" 
            fill="#050505" 
            stroke="#A8A3F8" 
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Horizontal Line */}
          <line x1="25" y1="50" x2="75" y2="50" stroke="#A8A3F8" strokeWidth="1.5" />
          {/* Vertical Line */}
          <line x1="50" y1="50" x2="50" y2="84.6" stroke="#A8A3F8" strokeWidth="1.5" />
        </svg>

        {/* Content Overlays */}
        {/* Top Section */}
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
          <span className="text-[#A8A3F8] text-3xl md:text-4xl font-black mb-0.5">{data.top.symbol}</span>
          <span className="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{data.top.label}</span>
        </div>

        {/* Bottom Left Section */}
        <div className="absolute bottom-[12%] left-[28%] -translate-x-1/2 flex flex-col items-center text-center">
          <span className="text-[#A8A3F8] text-2xl md:text-3xl font-black mb-0.5">{data.left.symbol}</span>
          <span className="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{data.left.label}</span>
        </div>

        {/* Multiplication Sign */}
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2">
          <X size={20} className="text-[#A8A3F8]/60" />
        </div>

        {/* Bottom Right Section */}
        <div className="absolute bottom-[12%] right-[28%] translate-x-1/2 flex flex-col items-center text-center">
          <span className="text-[#A8A3F8] text-2xl md:text-3xl font-black mb-0.5">{data.right.symbol}</span>
          <span className="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{data.right.label}</span>
        </div>
      </div>
    </div>
  );
};

// Flashcards Viewer Component
const FlashcardsViewer = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{title: string, cards: {q: string, a: string}[]} | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<number, 'known'|'unknown'>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState<'known'|'unknown'|null>(null);

  useEffect(() => {
    try {
      // Clean up the content string before parsing
      // Sometimes the model might include extra whitespace or markdown artifacts
      const cleanedContent = content.trim().replace(/^```json\s*/, '').replace(/```$/, '');
      if (cleanedContent) {
        setData(JSON.parse(cleanedContent));
      }
    } catch (e) {
      // Only log if it's not a typical streaming incomplete JSON error
      if (!(e instanceof SyntaxError && e.message.includes('JSON'))) {
        console.error("Invalid flashcards JSON", e, content);
      }
    }
  }, [content]);

  if (!data || !data.cards || data.cards.length === 0) return null;

  const handleNext = () => {
    if (currentIndex < data.cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleMark = (status: 'known'|'unknown') => {
    setResults(prev => ({ ...prev, [currentIndex]: status }));
    handleNext();
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setIsFinished(false);
    setReviewMode(null);
  };

  const knownCount = Object.values(results).filter(v => v === 'known').length;
  const unknownCount = Object.values(results).filter(v => v === 'unknown').length;

  return (
    <>
      <div className="my-6">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-4 bg-gradient-to-r from-[#A8A3F8]/20 to-[#A8A3F8]/5 border border-[#A8A3F8]/30 text-[#A8A3F8] px-6 py-4 rounded-2xl hover:bg-[#A8A3F8]/20 transition-all shadow-lg"
        >
          <div className="p-3 bg-[#A8A3F8]/20 rounded-xl">
            <Layers size={28} />
          </div>
          <div className="flex flex-col items-start text-right">
            <span className="font-bold text-lg">{data.title}</span>
            <span className="text-sm opacity-80">{data.cards.length} بطاقات تعليمية • انقر للبدء</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111111]">
              <h3 className="font-bold text-lg text-white truncate pr-2">{data.title}</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Progress */}
            {!isFinished && (
              <div className="w-full h-1.5 bg-white/10">
                <motion.div
                  className="h-full bg-[#A8A3F8]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex) / data.cards.length) * 100}%` }}
                />
              </div>
            )}

            {/* Body */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4">
              {!isFinished ? (
                <motion.div
                  key={currentIndex}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x < -50) handleNext();
                    else if (offset.x > 50) handlePrev();
                  }}
                  className="w-full max-w-md aspect-[3/4] md:aspect-square relative [perspective:1000px]"
                >
                  <motion.div
                    className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 [backface-visibility:hidden] bg-[#111111] border-2 border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                      <span className="text-3xl md:text-4xl font-bold text-white leading-relaxed">{data.cards[currentIndex].q}</span>
                      <div className="absolute bottom-8 flex items-center gap-2 text-[#A8A3F8]/70 text-sm font-bold bg-[#A8A3F8]/10 px-4 py-2 rounded-full">
                        <RotateCcw size={16} />
                        <span>انقر لعرض الإجابة</span>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-[#A8A3F8] to-[#8b85e6] text-[#050505] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
                      <span className="text-2xl md:text-3xl font-bold leading-relaxed">{data.cards[currentIndex].a}</span>
                      <div className="absolute bottom-8 flex items-center gap-2 text-[#050505]/70 text-sm font-bold bg-black/10 px-4 py-2 rounded-full">
                        <RotateCcw size={16} />
                        <span>انقر للعودة للسؤال</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                /* Finish Screen */
                <div className="w-full max-w-md h-full flex flex-col justify-center">
                  {reviewMode ? (
                    <div className="w-full h-full flex flex-col pt-4">
                      <button onClick={() => setReviewMode(null)} className="mb-6 text-[#A8A3F8] flex items-center gap-2 font-bold bg-white/5 w-fit px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
                        <ChevronRight size={20} /> عودة للنتائج
                      </button>
                      <h2 className="text-xl font-bold text-white mb-4 px-2">
                        {reviewMode === 'known' ? 'الإجابات الصحيحة' : 'تحتاج مراجعة'}
                      </h2>
                      <div className="flex-1 overflow-y-auto space-y-4 pb-20 px-2">
                        {data.cards.filter((_, i) => results[i] === reviewMode).map((c, i) => (
                          <div key={i} className="bg-[#111111] p-5 rounded-2xl border border-white/10">
                            <div className="text-white font-bold mb-3 pb-3 border-b border-white/10 text-lg">{c.q}</div>
                            <div className="text-[#A8A3F8] font-medium text-lg">{c.a}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                      <div className="text-6xl mb-6">🎉</div>
                      <h2 className="text-3xl font-bold text-white mb-8">اكتملت المراجعة!</h2>
                      
                      <div className="flex w-full gap-4 mb-10">
                        <div 
                          onClick={() => setReviewMode('known')}
                          className="flex-1 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 cursor-pointer hover:bg-green-500/20 transition-colors"
                        >
                          <div className="text-green-500 mb-3"><Check size={40} className="mx-auto" /></div>
                          <div className="text-4xl font-black text-white mb-2">{knownCount}</div>
                          <div className="text-sm text-green-500/90 font-bold">إجابة صحيحة</div>
                        </div>
                        
                        <div 
                          onClick={() => setReviewMode('unknown')}
                          className="flex-1 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 cursor-pointer hover:bg-red-500/20 transition-colors"
                        >
                          <div className="text-red-500 mb-3"><X size={40} className="mx-auto" /></div>
                          <div className="text-4xl font-black text-white mb-2">{unknownCount}</div>
                          <div className="text-sm text-red-500/90 font-bold">تحتاج مراجعة</div>
                        </div>
                      </div>

                      <button onClick={reset} className="w-full py-4 rounded-2xl bg-[#A8A3F8] text-[#050505] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#9690f5] transition-colors">
                        <RotateCcw size={24} />
                        إعادة المراجعة
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Controls */}
            {!isFinished && (
              <div className="p-6 pb-10 flex items-center justify-center gap-6 md:gap-10 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="p-4 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
                  <ChevronRight size={28} />
                </button>

                <button onClick={() => handleMark('unknown')} className="p-6 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500/30 hover:bg-red-500/30 transition-colors shadow-lg shadow-red-500/10">
                  <X size={36} />
                </button>

                <button onClick={() => handleMark('known')} className="p-6 rounded-full bg-green-500/20 text-green-500 border-2 border-green-500/30 hover:bg-green-500/30 transition-colors shadow-lg shadow-green-500/10">
                  <Check size={36} />
                </button>

                <button onClick={handleNext} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <ChevronLeft size={28} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Interactive Example Component
const InteractiveExample = ({ content }: { content: string }) => {
  const [showSolution, setShowSolution] = useState(false);

  let exampleData: any = null;
  try {
    exampleData = JSON.parse(content);
  } catch (e) {
    return null;
  }

  if (!exampleData || !exampleData.question || !exampleData.steps) return null;

  return (
    <div className="my-6 w-full max-w-3xl mx-auto">
      <div className="bg-[#111111] border border-[#A8A3F8]/30 rounded-2xl overflow-hidden shadow-lg">
        {/* Question Header */}
        <div className="p-5 md:p-6 bg-gradient-to-br from-[#1A1A24] to-[#111118] border-b border-[#A8A3F8]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#A8A3F8]/20 p-2 rounded-lg">
              <PenTool size={20} className="text-[#A8A3F8]" />
            </div>
            <h3 className="text-[#A8A3F8] font-bold text-lg">مثال / تمرين</h3>
          </div>
          <div className="text-white text-lg md:text-xl font-medium leading-relaxed" dir="auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => <span className="inline">{children}</span>,
              }}
            >
              {exampleData.question}
            </ReactMarkdown>
          </div>
        </div>

        {/* Solution Area */}
        {showSolution ? (
          <div className="p-5 md:p-6 bg-[#0A0A0A] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-6">
              {exampleData.steps.map((step: any, idx: number) => (
                <div key={idx} className="relative pl-4 md:pl-6 border-r-2 border-[#A8A3F8]/30 pr-4 md:pr-6">
                  <div className="absolute top-0 right-[-9px] w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-[#A8A3F8]"></div>
                  <div className="text-white font-medium text-base md:text-lg mb-2" dir="auto">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {step.step}
                    </ReactMarkdown>
                  </div>
                  {step.explanation && (
                    <div className="text-neutral-400 text-sm md:text-base leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5" dir="auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {step.explanation}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowSolution(false)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-colors font-medium text-sm md:text-base"
              >
                إخفاء الحل
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex justify-center bg-[#0A0A0A]">
            <button 
              onClick={() => setShowSolution(true)}
              className="flex items-center gap-2 bg-[#A8A3F8] hover:bg-[#958df5] text-[#050505] px-8 py-3 rounded-xl transition-all font-bold text-base md:text-lg shadow-lg shadow-[#A8A3F8]/20 hover:scale-105 active:scale-95"
            >
              <CheckCircle size={20} />
              عرض الحل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PdfCard = ({ content, onPreview, onPrint }: { content: string, onPreview: (html: string) => void, onPrint: (html: string) => void }) => {
  return (
    <div className="my-6 w-full max-w-3xl mx-auto bg-[#111111] border border-purple-500/30 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 relative z-10">
        <FileText size={40} className="text-purple-400" />
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 z-10 w-full">
        <button 
          onClick={() => onPreview(content)}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <Eye size={20} /> معاينة
        </button>
        <button 
          onClick={() => onPrint(content)}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-300 hover:to-indigo-400 text-[#050505] px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95"
        >
          <Printer size={20} /> طباعة PDF
        </button>
      </div>
    </div>
  );
};

const preprocessContent = (content: string) => {
  // Split by code blocks to avoid replacing inside them
  const parts = content.split(/(```[\s\S]*?```)/g);
  const arrowRegex = /(➔|→|←|⬅️|➡️|⬆️|⬇️)/g;
  
  const processedParts = parts.map(part => {
    if (part.startsWith('```')) return part;
    return part.replace(arrowRegex, '<span class="text-[#A8A3F8] font-bold mx-1">$1</span>');
  });
  
  let processed = processedParts.join('');

  // Remove surrounding code block markers if they enclose PDF tags
  processed = processed.replace(/```(?:html)?\s*<!--PDF_START-->/gi, '<!--PDF_START-->');
  processed = processed.replace(/<!--PDF_END-->\s*```/gi, '<!--PDF_END-->');

  // Replace PDF blocks with a custom code block
  const pdfRegex = /<!--PDF_START-->([\s\S]*?)<!--PDF_END-->/g;
  processed = processed.replace(pdfRegex, (match, p1) => {
    return `\n\`\`\`pdf\n${p1}\n\`\`\`\n`;
  });

  // Hide incomplete PDF blocks during streaming
  const incompletePdfRegex = /<!--PDF_START-->([\s\S]*)$/;
  if (incompletePdfRegex.test(processed)) {
    processed = processed.replace(incompletePdfRegex, '\n```pdf_loading\n```\n');
  }

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

const getMarkdownComponents = (onPreview: (html: string) => void, onPrint: (html: string) => void): any => ({
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
    if (!inline && match && match[1] === 'example') {
      return <InteractiveExample content={String(children).replace(/\n$/, '')} />;
    }
    if (!inline && match && match[1] === 'triangle') {
      return <FormulaTriangle content={String(children).replace(/\n$/, '')} />;
    }
    if (!inline && match && match[1] === 'flashcards') {
      return <FlashcardsViewer content={String(children).replace(/\n$/, '')} />;
    }
    if (!inline && match && match[1] === 'pdf') {
      return <PdfCard content={String(children).replace(/\n$/, '')} onPreview={onPreview} onPrint={onPrint} />;
    }
    if (!inline && match && match[1] === 'pdf_loading') {
      return (
        <div className="my-6 w-full max-w-3xl mx-auto bg-[#111111] border border-[#A8A3F8]/30 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#A8A3F8]/5 to-transparent animate-pulse"></div>
          <Loader2 size={40} className="text-[#A8A3F8] animate-spin mb-4" />
          <h3 className="text-xl font-bold text-[#A8A3F8] z-10 text-center">جاري إنشاء وتنسيق ملف PDF...</h3>
          <p className="text-neutral-400 mt-2 z-10 text-center">يرجى الانتظار بينما نقوم بتجهيز التصميم الاحترافي.</p>
        </div>
      );
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
});

const PdfPreviewModal = ({ isOpen, onClose, content, onSave }: { isOpen: boolean, onClose: () => void, content: string | null, onSave: (html: string) => void }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const initialZoom = useRef<number>(100);
  const zoomTimeout = useRef<any>(null);

  // Apply zoom to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      iframeRef.current.contentDocument.body.style.zoom = `${zoomLevel}%`;
    }
    
    setShowZoomIndicator(true);
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    zoomTimeout.current = setTimeout(() => setShowZoomIndicator(false), 1500);
  }, [zoomLevel, isOpen]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ZOOM_WHEEL') {
        const delta = e.data.deltaY > 0 ? -10 : 10;
        setZoomLevel(prev => Math.min(200, Math.max(30, prev + delta)));
      } else if (e.data?.type === 'ZOOM_TOUCH_START') {
        initialZoom.current = zoomLevel;
      } else if (e.data?.type === 'ZOOM_TOUCH_MOVE') {
        const newZoom = Math.round(initialZoom.current * e.data.delta);
        setZoomLevel(Math.min(200, Math.max(30, newZoom)));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [zoomLevel]);

  useEffect(() => {
    if (isOpen && content && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body {
                font-family: 'Cairo', sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .pdf-page {
                background: white;
                width: 210mm;
                max-width: 100%;
                min-height: 297mm;
                padding: 20mm;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                box-sizing: border-box;
                position: relative;
                overflow-x: hidden;
              }
              @media screen and (max-width: 768px) {
                body {
                  padding: 10px;
                }
                .pdf-page {
                  padding: 10mm;
                  min-height: auto;
                }
              }
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                .pdf-page {
                  width: 210mm;
                  min-height: 297mm;
                  padding: 20mm;
                  margin: 0;
                  box-shadow: none;
                  page-break-after: always;
                }
                .pdf-page:last-child {
                  page-break-after: auto;
                }
              }
              /* Add editable styles */
              [contenteditable="true"] {
                outline: none;
                transition: background-color 0.2s;
              }
              body.edit-mode [contenteditable="true"]:hover {
                background-color: rgba(168, 163, 248, 0.1);
                cursor: text;
              }
              body.edit-mode [contenteditable="true"]:focus {
                background-color: rgba(168, 163, 248, 0.2);
                border-bottom: 2px dashed #A8A3F8;
              }
              
              /* Print optimizations */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body class="${isEditMode ? 'edit-mode' : ''}">
            <div class="pdf-document">
              ${content}
            </div>
            <script>
              // Make text elements editable based on mode
              const updateEditableState = (isEditable) => {
                document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th').forEach(el => {
                  if(el.children.length === 0 || Array.from(el.childNodes).every(n => n.nodeType === Node.TEXT_NODE)) {
                     el.setAttribute('contenteditable', isEditable ? 'true' : 'false');
                  }
                });
              };
              
              updateEditableState(${isEditMode});

              // Listen for mode changes from parent
              window.addEventListener('message', (e) => {
                if (e.data?.type === 'SET_EDIT_MODE') {
                  if (e.data.isEditMode) {
                    document.body.classList.add('edit-mode');
                  } else {
                    document.body.classList.remove('edit-mode');
                  }
                  updateEditableState(e.data.isEditMode);
                }
              });

              // Forward wheel events for zoom to parent
              document.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'ZOOM_WHEEL', deltaY: e.deltaY }, '*');
                }
              }, { passive: false });

              // Forward touch events for pinch zoom to parent
              let initialDistance = 0;
              document.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                  e.preventDefault();
                  const touch1 = e.touches[0];
                  const touch2 = e.touches[1];
                  initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                  window.parent.postMessage({ type: 'ZOOM_TOUCH_START' }, '*');
                }
              }, { passive: false });

              document.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                  e.preventDefault();
                  const touch1 = e.touches[0];
                  const touch2 = e.touches[1];
                  const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                  const delta = currentDistance / initialDistance;
                  window.parent.postMessage({ type: 'ZOOM_TOUCH_MOVE', delta }, '*');
                }
              }, { passive: false });
            </script>
          </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [isOpen, content]);

  // Update edit mode in iframe when it changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'SET_EDIT_MODE', isEditMode }, '*');
    }
  }, [isEditMode]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      // Get the edited content from the iframe
      const editedContent = iframeRef.current.contentDocument.querySelector('.pdf-document')?.innerHTML || content;
      
      // Create a hidden print area in the main document
      const printArea = document.createElement('div');
      printArea.id = 'pdf-print-area';
      printArea.innerHTML = editedContent || '';
      document.body.appendChild(printArea);
      
      // Print
      window.print();
      
      // Cleanup
      document.body.removeChild(printArea);
    }
  };

  const handleSave = () => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      const editedContent = iframeRef.current.contentDocument.querySelector('.pdf-document')?.innerHTML || content;
      if (editedContent) {
        onSave(editedContent);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full h-full flex flex-col overflow-hidden relative"
        >
          {/* Zoom Indicator */}
          {showZoomIndicator && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/80 backdrop-blur-md border border-[#A8A3F8]/30 px-4 py-2 rounded-full shadow-2xl animate-in fade-in zoom-in duration-300 pointer-events-none">
              <span className="text-[#A8A3F8] font-bold text-sm">
                الزوم: {zoomLevel}%
              </span>
            </div>
          )}

          {/* Floating Actions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#111111]/90 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl z-50">
            {isEditMode ? (
              <>
                <button 
                  onClick={() => {
                    handleSave();
                    setIsEditMode(false);
                  }}
                  title="حفظ التعديلات"
                  className="w-12 h-12 flex items-center justify-center bg-[#A8A3F8] hover:bg-[#918cf2] text-[#050505] rounded-full transition-all shadow-lg shadow-[#A8A3F8]/20 hover:scale-105 active:scale-95"
                >
                  {isSaved ? <CheckCircle size={22} /> : <Save size={22} />}
                </button>
                <div className="w-[1px] h-8 bg-white/10 mx-1"></div>
                <button 
                  onClick={() => setIsEditMode(false)}
                  title="إلغاء التعديل"
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-full transition-colors"
                >
                  <X size={22} />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditMode(true)}
                  title="تعديل الملف"
                  className="w-12 h-12 flex items-center justify-center bg-[#A8A3F8] hover:bg-[#918cf2] text-[#050505] rounded-full transition-all shadow-lg shadow-[#A8A3F8]/20 hover:scale-105 active:scale-95"
                >
                  <PenLine size={22} />
                </button>
                <button 
                  onClick={handlePrint}
                  title="طباعة PDF"
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-[#A8A3F8] to-[#8b85f0] hover:from-[#918cf2] hover:to-[#7a74e6] text-[#050505] rounded-full transition-all shadow-lg shadow-[#A8A3F8]/20 hover:scale-105 active:scale-95"
                >
                  <Printer size={22} />
                </button>
                <div className="w-[1px] h-8 bg-white/10 mx-1"></div>
                <button 
                  onClick={onClose}
                  title="إغلاق"
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-full transition-colors"
                >
                  <X size={22} />
                </button>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 bg-[#f5f5f5] relative overflow-hidden">
            {content ? (
              <iframe 
                ref={iframeRef}
                className="w-full h-full border-none bg-transparent"
                title="PDF Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p>جاري تحميل المعاينة...</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SourcesModal = ({ isOpen, onClose, sources, setSources }: any) => {
  const [activeTab, setActiveTab] = useState<SourceType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputName, setInputName] = useState('');
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAddTextUrl = (type: SourceType) => {
    if (!inputValue.trim()) return;
    
    if (editingSourceId) {
      setSources(sources.map((s: Source) => 
        s.id === editingSourceId 
          ? { ...s, name: inputName.trim() || s.name, content: inputValue }
          : s
      ));
      setEditingSourceId(null);
    } else {
      const newSource: Source = {
        id: Date.now().toString(),
        type,
        name: inputName.trim() || (type === 'url' ? 'رابط ويب' : type === 'youtube' ? 'يوتيوب' : 'نص'),
        content: inputValue
      };
      setSources([...sources, newSource]);
    }
    
    setInputValue('');
    setInputName('');
    setActiveTab(null);
  };

  const handleStartEdit = (src: Source) => {
    setEditingSourceId(src.id);
    setActiveTab(src.type);
    setInputValue(src.content || '');
    setInputName(src.name);
  };

  const handleCancelEdit = () => {
    setEditingSourceId(null);
    setActiveTab(null);
    setInputValue('');
    setInputName('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'audio') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSources((prev: Source[]) => [...prev, {
          id: Date.now().toString() + Math.random(),
          type,
          name: file.name,
          file: {
            data: base64String,
            mimeType: file.type,
            name: file.name
          }
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
    setActiveTab(null);
  };

  const handleAddWebSearch = () => {
    if (!sources.some((s: Source) => s.type === 'web_search')) {
      setSources([...sources, { id: Date.now().toString(), type: 'web_search', name: 'بحث الويب' }]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" dir="rtl">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Bottom Sheet */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="relative bg-[#111111] border-t border-white/10 rounded-t-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10"
          >
            {/* Drag Handle - Clickable to close */}
            <button 
              onClick={onClose}
              className="w-12 h-1.5 bg-white/20 hover:bg-white/30 rounded-full mx-auto mt-4 mb-6 shrink-0 cursor-pointer transition-colors active:scale-95"
              aria-label="إغلاق"
            />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 pb-12">
              {/* Current Sources */}
              {sources.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-neutral-400">المصادر المضافة ({sources.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sources.map((src: Source) => (
                      <div key={src.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-[#A8A3F8]/10 rounded-lg text-[#A8A3F8] shrink-0">
                            {src.type === 'pdf' && <FileText size={18} />}
                            {src.type === 'audio' && <Headphones size={18} />}
                            {src.type === 'url' && <LinkIcon size={18} />}
                            {src.type === 'youtube' && <Youtube size={18} />}
                            {src.type === 'text' && <Type size={18} />}
                            {src.type === 'web_search' && <Globe size={18} />}
                          </div>
                          <span className="text-sm text-neutral-200 truncate font-medium">{src.name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          {(src.type === 'url' || src.type === 'youtube' || src.type === 'text') && (
                            <button 
                              onClick={() => handleStartEdit(src)} 
                              className="p-2 text-neutral-500 hover:text-[#A8A3F8]"
                              title="تعديل"
                            >
                              <PenTool size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSources(sources.filter((s: Source) => s.id !== src.id))} 
                            className="p-2 text-neutral-500 hover:text-red-400"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Source */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-400">إضافة مصدر جديد</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A8A3F8]/30 transition-all text-neutral-300 hover:text-[#A8A3F8]">
                    <FileText size={28} />
                    <span className="text-sm font-medium">ملف PDF</span>
                  </button>
                  <button onClick={() => audioInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A8A3F8]/30 transition-all text-neutral-300 hover:text-[#A8A3F8]">
                    <Headphones size={28} />
                    <span className="text-sm font-medium">ملف صوتي</span>
                  </button>
                  <button onClick={() => setActiveTab('url')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A8A3F8]/30 transition-all text-neutral-300 hover:text-[#A8A3F8]">
                    <LinkIcon size={28} />
                    <span className="text-sm font-medium">رابط موقع</span>
                  </button>
                  <button onClick={() => setActiveTab('youtube')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A8A3F8]/30 transition-all text-neutral-300 hover:text-[#A8A3F8]">
                    <Youtube size={28} />
                    <span className="text-sm font-medium">يوتيوب</span>
                  </button>
                  <button onClick={() => setActiveTab('text')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A8A3F8]/30 transition-all text-neutral-300 hover:text-[#A8A3F8]">
                    <Type size={28} />
                    <span className="text-sm font-medium">كتابة نص</span>
                  </button>
                  <button onClick={handleAddWebSearch} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A8A3F8]/30 transition-all text-neutral-300 hover:text-[#A8A3F8]">
                    <Globe size={28} />
                    <span className="text-sm font-medium">بحث الويب</span>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => handleFileSelect(e, 'pdf')} />
                <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" multiple onChange={(e) => handleFileSelect(e, 'audio')} />

                {/* Input Forms */}
                {activeTab && (activeTab === 'url' || activeTab === 'youtube' || activeTab === 'text') && (
                  <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">
                        {editingSourceId ? 'تعديل المصدر' : (activeTab === 'url' ? 'إضافة رابط موقع' : activeTab === 'youtube' ? 'إضافة رابط يوتيوب' : 'إضافة نص')}
                      </h4>
                      <button onClick={handleCancelEdit} className="text-neutral-500 hover:text-white"><X size={18} /></button>
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="اسم المصدر (اختياري)" 
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#A8A3F8]/50"
                    />

                    {activeTab === 'text' ? (
                      <textarea 
                        placeholder="اكتب النص هنا..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#A8A3F8]/50 min-h-[120px] resize-y"
                      />
                    ) : (
                      <input 
                        type="text" 
                        placeholder="الصق الرابط هنا..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#A8A3F8]/50"
                        dir="ltr"
                      />
                    )}

                    <button 
                      onClick={() => handleAddTextUrl(activeTab)}
                      disabled={!inputValue.trim()}
                      className="w-full bg-[#A8A3F8] text-black font-bold py-3 rounded-xl hover:bg-[#918cf2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {editingSourceId ? 'حفظ التعديلات' : 'إضافة'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [secretInput, setSecretInput] = useState('');

  const generateAIPdf = () => {
    try {
      const doc = new jsPDF();
      // Set font to a basic one that supports some characters or just use standard
      doc.setFontSize(22);
      doc.text("Artificial Intelligence (AI)", 105, 20, { align: "center" });
      doc.setFontSize(14);
      doc.text("What is AI?", 20, 40);
      doc.setFontSize(12);
      const text = "Artificial Intelligence is a branch of computer science that aims to build systems capable of simulating human intelligence. This includes learning, reasoning, and self-correction. It is used today in many fields such as medicine, education, and self-driving cars.";
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, 50);
      
      doc.text("Importance of AI:", 20, 80);
      const importance = "1. Improving efficiency and productivity.\n2. Analyzing big data quickly.\n3. Providing innovative solutions to complex problems.";
      const splitImportance = doc.splitTextToSize(importance, 170);
      doc.text(splitImportance, 20, 90);

      doc.save("AI_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track numbers
      if (/^[0-9]$/.test(e.key)) {
        setSecretInput(prev => {
          const next = (prev + e.key).slice(-3);
          if (next === '111') {
            generateAIPdf();
            return '';
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
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

  const [chatOptionsId, setChatOptionsId] = useState<string | null>(null);
  const [isRenamingId, setIsRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aqeel_ai_current_chat_id_v2');
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-pro-preview');
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  // Auto-activate source mode when sources are added
  useEffect(() => {
    if (sources.length > 0) {
      setIsSourceMode(true);
    } else {
      setIsSourceMode(false);
    }
  }, [sources]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(70);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState<{ html: string, hash: string } | null>(null);
  const [pdfEdits, setPdfEdits] = useState<Record<string, string>>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(70);
  const zoomTimeout = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const prevChatIdRef = useRef<string | null>(currentChatId);

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

  // Scroll to bottom or restore position
  useLayoutEffect(() => {
    if (!chatContainerRef.current) return;

    if (prevChatIdRef.current !== currentChatId) {
      // Chat switched
      if (currentChatId && scrollPositionsRef.current[currentChatId] !== undefined) {
        // Restore saved position instantly
        chatContainerRef.current.scrollTo({
          top: scrollPositionsRef.current[currentChatId],
          behavior: 'auto'
        });
      } else {
        // New chat or no saved position, scroll to bottom instantly
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'auto'
        });
      }
      prevChatIdRef.current = currentChatId;
    }
  }, [messages.length, currentChatId]);

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
      const sourcesString = JSON.stringify(sources);
      const syncKey = messagesString + sourcesString + isSourceMode;
      
      if (lastSyncedMessagesRef.current === syncKey) return;
      
      lastSyncedMessagesRef.current = syncKey;

      setChats(prev => {
        const chatIndex = prev.findIndex(c => c.id === currentChatId);
        if (chatIndex === -1) return prev;
        
        const updated = [...prev];
        updated[chatIndex] = { 
          ...updated[chatIndex], 
          messages: messages,
          timestamp: Date.now(),
          sources: sources,
          isSourceMode: isSourceMode
        };
        return updated;
      });
    }
  }, [messages, currentChatId, isLoading, sources, isSourceMode]);

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setMessage('');
    setAttachments([]);
    setIsSidebarOpen(false);
    setIsSourceMode(false);
    setSources([]);
  };

  const switchChat = (id: string) => {
    setCurrentChatId(id);
    const activeChat = chats.find(c => c.id === id);
    if (activeChat) {
      setMessages(activeChat.messages);
      setIsSourceMode(activeChat.isSourceMode || false);
      setSources(activeChat.sources || []);
    } else {
      setMessages([]);
      setIsSourceMode(false);
      setSources([]);
    }
    setIsSidebarOpen(false);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    if (e) e.stopPropagation();
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const renameChat = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChats(chats.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const togglePinChat = (id: string) => {
    setChats(chats.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
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
      // Simulate natural thinking time based on question complexity
      const msgLength = userMessage.content.length;
      let delayMs = 0;
      if (msgLength < 50) {
        // Simple question: 1 - 3 seconds
        delayMs = Math.floor(Math.random() * 2000) + 1000;
      } else if (msgLength < 200) {
        // Medium question: 3 - 5 seconds
        delayMs = Math.floor(Math.random() * 2000) + 3000;
      } else {
        // Long/Complex question: 5 - 10 seconds
        delayMs = Math.floor(Math.random() * 5000) + 5000;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));

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

      // Inject sources if Source Mode is active
      if (isSourceMode && sources.length > 0) {
        const sourceParts: any[] = [];
        sourceParts.push({ text: "المصادر المرفقة التي يجب الاعتماد عليها 100% في الإجابة. إذا لم تكن المعلومات موجودة في المصادر، قل أنك لا تعرف:\n" });
        
        sources.forEach(src => {
          if ((src.type === 'pdf' || src.type === 'audio') && src.file) {
            sourceParts.push({
              inlineData: { data: src.file.data, mimeType: src.file.mimeType }
            });
          } else if (src.type === 'text') {
            sourceParts.push({ text: `\n--- نص مصدر (${src.name}) ---\n${src.content}\n` });
          } else if (src.type === 'url' || src.type === 'youtube') {
            sourceParts.push({ text: `\n--- رابط مصدر (${src.name}) ---\n${src.content}\n` });
          }
        });
        
        contents.push({ role: 'user', parts: sourceParts });
        contents.push({ role: 'model', parts: [{ text: "حسناً، سأعتمد على هذه المصادر فقط في إجاباتي القادمة." }] });
        lastRole = 'model';
      }

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

      const tools: any[] = [];
      let useWebSearch = false;
      let useUrlContext = false;

      if (isSourceMode) {
        if (sources.some(s => s.type === 'web_search')) {
          useWebSearch = true;
        }
        if (sources.some(s => s.type === 'url' || s.type === 'youtube')) {
          useUrlContext = true;
        }
      }

      if (useWebSearch) {
        tools.push({ googleSearch: {} });
      }
      if (useUrlContext) {
        tools.push({ urlContext: {} });
      }

      let currentSystemInstruction = SYSTEM_INSTRUCTION;
      if (isSourceMode) {
        currentSystemInstruction += "\n\n**تنبيه هام جداً:** وضع المصدر مفعل. يجب عليك الاعتماد بنسبة 100% على المصادر المرفقة فقط للإجابة على أسئلة المستخدم. لا تستخدم معلوماتك العامة. إذا كانت الإجابة غير موجودة في المصادر، اعتذر وقل أن المعلومات غير متوفرة في المصادر المرفقة.";
      }
      if (isPdfMode) {
        currentSystemInstruction += `\n\nأنت مساعد متخصص في إنشاء مستندات وملازم دراسية احترافية جداً بصيغة HTML تُطبع كـ PDF.
قواعدك الأساسية:
1. عندما يطلب المستخدم إنشاء ملف، أنشئ كود HTML كامل وضعه بين علامتي <!--PDF_START--> و <!--PDF_END-->
2. ركز بنسبة 80% على تصميم "الملازم الدراسية" (Study Materials): استخدم تصاميم إبداعية، مربعات نصوص احترافية للملاحظات، إطارات للمفاهيم الهامة، جداول منسقة، ترويسة (Header) وتذييل (Footer) لكل صفحة، ترقيم صفحات، غلاف ملزمة جذاب.
3. ركز بنسبة 20% على أنواع المستندات الأخرى (تقارير، سير ذاتية، عقود) بتصاميم رسمية واحترافية.
4. استخدم Tailwind CSS عبر الـ classes المضمنة (حيث أن بيئة العرض تدعم Tailwind).
5. استخدم خط 'Cairo' أو 'Tajawal' للنصوص العربية، وتأكد من دعم RTL (<html dir="rtl">).
6. أضف ستايلات الطباعة \`@media print\` لضمان ظهور الألوان والخلفيات (\`-webkit-print-color-adjust: exact; print-color-adjust: exact;\`) وتحديد حجم الصفحة A4 (\`@page { size: A4; margin: 0; }\`).
7. استخدم \`page-break-after: always\` أو \`break-after: page\` لفصل الصفحات بشكل صحيح.
8. **الصور المرفقة**: إذا قام المستخدم بإرفاق صور، يمكنك إدراجها في الـ PDF باستخدام \`<img src="IMAGE_1" />\` للصورة الأولى، و \`<img src="IMAGE_2" />\` للصورة الثانية، وهكذا. سيقوم النظام تلقائياً باستبدال هذه الرموز بالصور الحقيقية.
9. اجعل التصاميم "أقوى تصاميم ملفات بالعالم": استخدم التدرجات اللونية (Gradients)، الظلال (Shadows)، الحواف الدائرية (Rounded corners)، والأيقونات (يمكنك استخدام SVG مضمنة).
10. يمكنك الدردشة مع المستخدم لتوضيح متطلباته قبل إنشاء الملف، وعندما يطلب الإنشاء، قم بتوليد الـ HTML.
11. عند طلب تعديل على ملف سابق، أعد إرسال كود HTML الكامل بعد التعديل.`;
      }

      if (!ai) {
        throw new Error("عذراً، مفتاح Gemini غير متوفر حالياً. يرجى التحقق من إعدادات الاستضافة.");
      }

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: currentSystemInstruction,
          tools: tools.length > 0 ? tools : undefined,
          toolConfig: tools.length > 0 ? { includeServerSideToolInvocations: true } : undefined
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
          // Smooth typing effect: add characters steadily.
          // If buffer is huge (e.g., network burst), speed up slightly but keep it smooth.
          const charsToAdd = diff > 100 ? 4 : diff > 50 ? 3 : diff > 20 ? 2 : 1;
          
          currentDisplayedText += fullText.substring(currentDisplayedText.length, currentDisplayedText.length + charsToAdd);
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: currentDisplayedText }
              : msg
          ));
        } else if (isStreamComplete) {
          clearInterval(typeInterval);
        }
      }, 20);

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

  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  };

  const handlePdfPreview = React.useCallback((html: string) => {
    const hash = getHash(html);
    let finalHtml = html;
    
    if (pdfEdits[hash]) {
      finalHtml = pdfEdits[hash];
    } else {
      let imgIndex = 1;
      messagesRef.current.forEach(msg => {
        msg.attachments?.forEach(att => {
          if (att.mimeType.startsWith('image/')) {
            const regex = new RegExp(`IMAGE_${imgIndex}`, 'g');
            finalHtml = finalHtml.replace(regex, `data:${att.mimeType};base64,${att.data}`);
            imgIndex++;
          }
        });
      });
    }
    setPdfPreviewContent({ html: finalHtml, hash });
  }, [pdfEdits]);

  const handlePdfPrint = React.useCallback((html: string) => {
    const hash = getHash(html);
    let finalHtml = html;
    
    if (pdfEdits[hash]) {
      finalHtml = pdfEdits[hash];
    } else {
      let imgIndex = 1;
      messagesRef.current.forEach(msg => {
        msg.attachments?.forEach(att => {
          if (att.mimeType.startsWith('image/')) {
            const regex = new RegExp(`IMAGE_${imgIndex}`, 'g');
            finalHtml = finalHtml.replace(regex, `data:${att.mimeType};base64,${att.data}`);
            imgIndex++;
          }
        });
      });
    }
    
    const printArea = document.createElement('div');
    printArea.id = 'pdf-print-area';
    printArea.innerHTML = `<div class="pdf-document">${finalHtml}</div>`;
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
  }, [pdfEdits]);

  const markdownComponents = React.useMemo(() => getMarkdownComponents(handlePdfPreview, handlePdfPrint), [handlePdfPreview, handlePdfPrint]);

  return (
    <div dir="rtl" className="flex h-full bg-[#050505] text-white font-sans overflow-hidden selection:bg-[#A8A3F8]/30">
      <PdfPreviewModal 
        isOpen={pdfPreviewContent !== null} 
        onClose={() => setPdfPreviewContent(null)} 
        content={pdfPreviewContent?.html || null} 
        onSave={(newHtml) => {
          if (pdfPreviewContent?.hash) {
            setPdfEdits(prev => ({ ...prev, [pdfPreviewContent.hash]: newHtml }));
          }
        }}
      />
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
      <motion.div 
        initial={false}
        animate={{ 
          x: sidebarDragX !== null ? sidebarDragX : (isSidebarOpen ? 0 : '100%')
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className={`
          fixed inset-y-0 right-0 z-50 w-[280px] bg-[#050505] flex flex-col
        `}
      >
        <div className="p-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text"
              placeholder="بحث في السجل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 rounded-xl py-2 pr-10 pl-10 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#A8A3F8]/30 transition-all"
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
              .sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.timestamp - a.timestamp;
              })
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
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <span className="truncate text-sm font-medium flex items-center gap-1.5">
                          {chat.pinned && <Pin size={10} className="text-[#A8A3F8] fill-[#A8A3F8]" />}
                          {chat.title}
                        </span>
                        {snippet && (
                          <span className="truncate text-[10px] opacity-60 font-normal text-neutral-400" dir="auto">
                            {snippet}
                          </span>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatOptionsId(chat.id);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-600 hover:text-[#A8A3F8] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical size={14} />
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
        <div className="p-3 border-t border-white/10">
          <button 
            onClick={generateAIPdf}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-[#A8A3F8] transition-all text-xs font-bold"
          >
            <Star size={14} />
            <span>111</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={false}
        animate={{ 
          x: sidebarDragX !== null ? -(sidebarWidth - sidebarDragX) : (isSidebarOpen ? -280 : 0)
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="flex-1 flex flex-col relative min-w-0"
      >
        {/* Zoom Indicator */}
        {showZoomIndicator && (
          <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/80 backdrop-blur-md border border-[#A8A3F8]/30 px-4 py-2 rounded-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <span className="text-[#A8A3F8] font-bold text-sm">
              الزوم: {zoomLevel}%
            </span>
          </div>
        )}

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-md border border-red-400/30 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
            <WifiOff size={16} className="text-white" />
            <span className="text-white font-bold text-xs md:text-sm">
              أنت تعمل الآن دون اتصال بالإنترنت
            </span>
          </div>
        )}

        {/* Header Controls */}
        <div className="absolute top-0 right-0 p-4 z-10 flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-neutral-400 hover:text-[#A8A3F8] transition-colors p-2 rounded-full hover:bg-[#222222] bg-[#1A1A1A] border border-white/5 shadow-lg"
            title="السجل"
          >
            <Menu size={24} />
          </button>
          <button 
            onClick={startNewChat}
            className="text-neutral-400 hover:text-[#A8A3F8] transition-colors p-2 rounded-full hover:bg-[#222222] bg-[#1A1A1A] border border-white/5 shadow-lg"
            title="محادثة جديدة"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          key={currentChatId || 'new'}
          ref={chatContainerRef}
          onScroll={(e) => {
            if (currentChatId) {
              scrollPositionsRef.current[currentChatId] = e.currentTarget.scrollTop;
            }
          }}
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-60 md:pb-80 pt-20"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center content-zoom">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-4"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  اهلا بك في <span className="text-[#A8A3F8]">KLYVON</span>
                </h1>
                <p className="text-neutral-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                  مساعدك الذكي المخصص للدراسة.
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 content-zoom">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    className="flex flex-col w-full"
                  >
                    <div className={`w-full ${msg.role === 'user' ? 'mt-8 mb-2' : 'text-neutral-200'}`}>
                      
                      {/* Attachments Display */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-nowrap gap-4 mb-3 overflow-x-auto pb-2">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="flex-shrink-0">
                              {att.mimeType.startsWith('image/') ? (
                                <img src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-32 h-32 object-cover rounded-lg border border-white/10 shadow-sm" />
                              ) : (
                                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 shadow-sm">
                                  <FileText size={16} className="text-[#A8A3F8]" />
                                  <span className="text-sm truncate max-w-[150px]">{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
  
                      {/* Message Content */}
                      {msg.role === 'user' ? (
                        <h2 className="whitespace-pre-wrap text-2xl md:text-3xl font-bold text-white text-start leading-relaxed border-s-4 border-[#A8A3F8] ps-4" dir="auto">{msg.content}</h2>
                      ) : (
                        <div className="markdown-body relative">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeRaw]}
                            components={markdownComponents}
                          >
                            {preprocessContent(msg.content)}
                          </ReactMarkdown>
                          {isLoading && msg.id === messages[messages.length - 1]?.id && (
                            <span className="inline-block w-2 h-5 bg-[#A8A3F8] animate-pulse ml-1 align-middle mt-1 rounded-sm"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start"
                >
                  <div className="text-neutral-400 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Loader2 size={16} className="animate-spin text-[#A8A3F8]" />
                    <span className="text-sm font-medium text-neutral-300">KLYVON يكتب...</span>
                  </div>
                </motion.div>
              )}
              {/* Bottom Spacer to ensure content is above input bar */}
              <div className="h-20 md:h-32" />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12"
        >
          <div className="max-w-3xl mx-auto relative">
            
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="flex flex-nowrap justify-start gap-4 mb-3 overflow-x-auto pb-2">
                {attachments.map((att, index) => (
                  <div key={index} className="relative group flex-shrink-0 mt-2 mr-2">
                    {att.mimeType.startsWith('image/') ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-32 h-32 object-cover rounded-lg border border-white/20" />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center bg-white/5 rounded-lg border border-white/20">
                        <FileText size={48} className="text-[#A8A3F8]" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 bg-neutral-500 text-white rounded-full p-1 shadow-lg z-10"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attachment Menu */}
            <AnimatePresence>
              {isAttachmentOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-[calc(100%+12px)] right-0 bg-[#1A1A1A] rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col gap-1 w-56 z-20"
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
                  <button onClick={() => { setIsSourcesModalOpen(true); setIsAttachmentOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-right transition-colors text-sm text-neutral-200">
                    <div className="bg-[#A8A3F8]/10 p-2 rounded-lg">
                      <Database size={18} className="text-[#A8A3F8]" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">المصادر</span>
                      {sources.length > 0 && <span className="text-[10px] text-[#A8A3F8] font-bold">{sources.length} مصادر</span>}
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="bg-[#1A1A1A] rounded-[32px] flex flex-col p-4 shadow-2xl border border-white/5 transition-all duration-300 focus-within:bg-[#1E1E1E] group">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isOnline ? "اسأل KLYVON" : "لا يمكن إرسال رسائل في وضع عدم الاتصال"}
                disabled={!isOnline}
                className={`w-full bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 resize-none max-h-[200px] min-h-[60px] py-2 px-0 outline-none text-lg leading-relaxed text-right ${!isOnline ? 'cursor-not-allowed opacity-50' : ''}`}
                rows={1}
                dir="rtl"
                style={{ overflowY: message.split('\n').length > 5 ? 'auto' : 'hidden' }}
              />
              
              <div className="flex items-center justify-between mt-2">
                {/* Right: Model & Plus */}
                <div className="flex items-center gap-2 relative">
                  {/* Plus Button */}
                  <button 
                    onClick={(e) => {
                      if (!isOnline) return;
                      e.stopPropagation();
                      setIsAttachmentOpen(!isAttachmentOpen);
                    }}
                    disabled={!isOnline}
                    className={`w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-all rounded-full bg-white/5 hover:bg-white/10 border border-white/5 ${!isOnline ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <Plus size={20} className={isAttachmentOpen ? "rotate-45 transition-transform duration-200" : "transition-transform duration-200"} />
                  </button>

                  {/* Model Selector */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                      className="bg-white/5 hover:bg-white/10 text-neutral-400 px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 border border-white/5"
                    >
                      {selectedModel === 'gemini-3.1-pro-preview' ? 'برو' : 
                       selectedModel === 'gemini-3.1-flash-preview' ? 'فلاش' : 'لايت'}
                    </button>

                    <AnimatePresence>
                      {isModelMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full mb-2 right-0 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 w-32 z-30"
                        >
                          <button 
                            onClick={() => { setSelectedModel('gemini-3.1-pro-preview'); setIsModelMenuOpen(false); }}
                            className={`p-3 rounded-xl text-right text-sm font-bold transition-colors ${selectedModel === 'gemini-3.1-pro-preview' ? 'bg-[#A8A3F8]/10 text-[#A8A3F8]' : 'text-neutral-400 hover:bg-white/5'}`}
                          >
                            برو
                          </button>
                          <button 
                            onClick={() => { setSelectedModel('gemini-3.1-flash-preview'); setIsModelMenuOpen(false); }}
                            className={`p-3 rounded-xl text-right text-sm font-bold transition-colors ${selectedModel === 'gemini-3.1-flash-preview' ? 'bg-[#A8A3F8]/10 text-[#A8A3F8]' : 'text-neutral-400 hover:bg-white/5'}`}
                          >
                            فلاش
                          </button>
                          <button 
                            onClick={() => { setSelectedModel('gemini-3.1-flash-lite-preview'); setIsModelMenuOpen(false); }}
                            className={`p-3 rounded-xl text-right text-sm font-bold transition-colors ${selectedModel === 'gemini-3.1-flash-lite-preview' ? 'bg-[#A8A3F8]/10 text-[#A8A3F8]' : 'text-neutral-400 hover:bg-white/5'}`}
                          >
                            لايت
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* PDF Button */}
                  <button 
                    onClick={() => setIsPdfMode(!isPdfMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg ${isPdfMode ? 'bg-gradient-to-r from-[#A8A3F8] to-[#8b85f0] text-[#050505] scale-105' : 'bg-[#1A1A1A] text-neutral-400 hover:bg-[#222222] hover:text-white border border-white/5'}`}
                  >
                    <FileText size={16} className={isPdfMode ? "fill-current" : ""} />
                    إنشاء PDF
                  </button>
                </div>

                {/* Left: Send Button */}
                <button 
                  onClick={handleSend}
                  disabled={(!message.trim() && attachments.length === 0) || isLoading || !isOnline}
                  className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0 ${(message.trim() || attachments.length > 0) && !isLoading && isOnline ? 'text-[#050505] bg-[#A8A3F8] shadow-lg shadow-[#A8A3F8]/20 scale-100 hover:scale-105 active:scale-95' : 'text-neutral-600 bg-white/5 scale-95 cursor-not-allowed'}`}
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <ArrowUp size={28} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <SourcesModal 
        isOpen={isSourcesModalOpen} 
        onClose={() => setIsSourcesModalOpen(false)} 
        sources={sources} 
        setSources={setSources} 
      />

      {/* Chat Options Bottom Sheet */}
      <AnimatePresence>
        {chatOptionsId && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOptionsId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-[#111111] border-t border-white/10 rounded-t-[2.5rem] w-full max-w-2xl p-6 pb-12 flex flex-col gap-4 z-10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />
              
              <button 
                onClick={() => {
                  togglePinChat(chatOptionsId);
                  setChatOptionsId(null);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-right"
                dir="rtl"
              >
                <div className="p-3 bg-[#A8A3F8]/10 rounded-xl text-[#A8A3F8]">
                  <Pin size={24} className={chats.find(c => c.id === chatOptionsId)?.pinned ? "fill-[#A8A3F8]" : ""} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-lg text-white">
                    {chats.find(c => c.id === chatOptionsId)?.pinned ? 'إلغاء التثبيت' : 'تثبيت المحادثة'}
                  </span>
                  <span className="text-sm text-neutral-400">إبقاء هذه المحادثة في الأعلى</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  const chat = chats.find(c => c.id === chatOptionsId);
                  if (chat) {
                    setRenameTitle(chat.title);
                    setIsRenamingId(chatOptionsId);
                  }
                  setChatOptionsId(null);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-right"
                dir="rtl"
              >
                <div className="p-3 bg-[#A8A3F8]/10 rounded-xl text-[#A8A3F8]">
                  <Edit2 size={24} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-lg text-white">إعادة تسمية</span>
                  <span className="text-sm text-neutral-400">تغيير عنوان المحادثة</span>
                </div>
              </button>

              <button 
                onClick={(e) => {
                  deleteChat(e as any, chatOptionsId);
                  setChatOptionsId(null);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-right"
                dir="rtl"
              >
                <div className="p-3 bg-[#A8A3F8]/10 rounded-xl text-[#A8A3F8]">
                  <Trash2 size={24} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-lg text-white">حذف المحادثة</span>
                  <span className="text-sm text-neutral-400">حذف هذه المحادثة نهائياً</span>
                </div>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {isRenamingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRenamingId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#111111] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl z-10"
              dir="rtl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">إعادة تسمية المحادثة</h3>
              <input 
                autoFocus
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameChat(isRenamingId, renameTitle);
                    setIsRenamingId(null);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#A8A3F8]/50 transition-colors mb-8"
                placeholder="أدخل العنوان الجديد..."
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    renameChat(isRenamingId, renameTitle);
                    setIsRenamingId(null);
                  }}
                  className="flex-1 bg-[#A8A3F8] text-black font-bold py-4 rounded-xl hover:bg-[#958df5] transition-colors"
                >
                  حفظ التغييرات
                </button>
                <button 
                  onClick={() => setIsRenamingId(null)}
                  className="flex-1 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
