import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';

interface SegregationMasterclassProps {
  addPoints: (points: number) => void;
}

interface Question {
  item: string;
  image: string;
  correctAnswer: string;
}

const questions: Question[] = [
  { item: 'Apple Core', image: '🍎', correctAnswer: 'Wet Waste' },
  { item: 'Plastic Bottle', image: '🍾', correctAnswer: 'Dry Waste' },
  { item: 'Used Battery', image: '🔋', correctAnswer: 'Hazardous' },
  { item: 'Newspaper', image: '📰', correctAnswer: 'Dry Waste' },
  { item: 'Vegetable Peels', image: '🥬', correctAnswer: 'Wet Waste' },
];

const options = ['Wet Waste', 'Dry Waste', 'Hazardous'];

const SegregationMasterclass: React.FC<SegregationMasterclassProps> = ({ addPoints }) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (answer: string) => {
    if (feedback) return;

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 10);
      addPoints(10);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const restartGame = () => {
      setCurrentQuestionIndex(0);
      setScore(0);
      setFeedback(null);
      setIsFinished(false);
  }

  if (isFinished) {
      return (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">{t('segregationComplete')}</h2>
            <p className="text-gray-600 mb-4">{t('segregationFinalScore', {score: score})}</p>
            <button
                onClick={restartGame}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
                {t('segregationRestart')}
            </button>
          </Card>
      );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('segregationTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('segregationChallenge')}</p>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{currentQuestion.item}</h3>
          <span className="font-bold text-lg text-green-700">{t('segregationScore', { score })}</span>
        </div>
        <div className="flex justify-center items-center h-48 my-8 bg-gray-100 rounded-lg p-6">
            <span className="text-7xl">{currentQuestion.image}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={!!feedback}
              className="bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
            >
              {option}
            </button>
          ))}
        </div>
        {feedback && (
          <div className={`mt-6 text-center text-xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback === 'correct' ? t('segregationCorrect') : t('segregationIncorrect')}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SegregationMasterclass;