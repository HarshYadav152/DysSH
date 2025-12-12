import React from 'react';
import { Mic, BookOpen, PenTool, X, Check } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-luminary-100 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-luminary-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-luminary-900">How to use Luminary</h2>
            <p className="text-luminary-600">Your personal learning companion.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-luminary-50 rounded-full transition-colors text-luminary-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Section 1 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-luminary-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Mic size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-luminary-900 mb-2">Reading Coach</h3>
              <p className="text-ink/80 leading-relaxed mb-3">
                Tap the microphone and start reading a book aloud. Luminary listens to you and helps if you get stuck on tricky words.
              </p>
              <div className="flex gap-2 text-sm text-luminary-600 font-medium bg-luminary-50 p-3 rounded-xl">
                 <Check size={18} /> "Great job on that sentence!"
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-luminary-900 mb-2">Textbook Simplifier</h3>
              <p className="text-ink/80 leading-relaxed mb-3">
                Take a photo of a confusing textbook page. Luminary will read it and explain the "Big Idea" in simple words.
              </p>
              <div className="flex gap-2 text-sm text-orange-600 font-medium bg-orange-50 p-3 rounded-xl">
                 <Check size={18} /> "Here is the summary..."
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex gap-4 md:gap-6 items-start">
            <div className="w-16 h-16 shrink-0 bg-teal-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <PenTool size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-luminary-900 mb-2">Handwriting Helper</h3>
              <p className="text-ink/80 leading-relaxed mb-3">
                Upload a picture of your written notes or homework. Luminary checks for spelling mistakes or math logic errors gently.
              </p>
              <div className="flex gap-2 text-sm text-teal-600 font-medium bg-teal-50 p-3 rounded-xl">
                 <Check size={18} /> "Remember: 'b' has a belly!"
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-luminary-50 border-t border-luminary-100 text-center">
          <button 
            onClick={onClose}
            className="w-full md:w-auto px-8 py-3 bg-luminary-900 text-white font-bold rounded-xl hover:bg-luminary-600 transition-colors shadow-lg"
          >
            Got it, let's learn! 🚀
          </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;