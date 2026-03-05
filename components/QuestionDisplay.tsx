'use client';

interface QuestionDisplayProps {
  question: string;
  questionNumber: number;
}

export default function QuestionDisplay({ question, questionNumber }: QuestionDisplayProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center">
          <span className="text-white text-xs font-bold">{questionNumber}</span>
        </div>
        <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wide">Lyndi Carson · Hiring Manager</span>
      </div>
      <div className="bg-[#1e3a5f] rounded-2xl rounded-tl-sm p-5">
        <p className="text-white text-lg leading-relaxed font-medium">{question}</p>
      </div>
    </div>
  );
}
