import React, { useState, useRef, useCallback, useEffect } from 'react';
import { classifyWasteImage, classifyWasteVideo } from '../services/geminiService.ts';
import { WasteClassificationResult, BadgeSlug } from '../types.ts';
import Card from './common/Card.tsx';
import Spinner from './common/Spinner.tsx';
import { CameraIcon, VideoIcon } from './common/Icons.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import ResultCard from './common/ResultCard.tsx';

interface WasteClassifierProps {
  unlockBadge: (slug: BadgeSlug) => void;
  addPoints: (points: number) => void;
  addClassificationToHistory: (result: WasteClassificationResult) => void;
}

const WasteClassifier: React.FC<WasteClassifierProps> = ({ unlockBadge, addPoints, addClassificationToHistory }) => {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState<'image' | 'video'>('image');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WasteClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scanCount === 1) {
      unlockBadge('first-scan');
    }
    if (scanCount === 5) {
      unlockBadge('novice-recycler');
    }
  }, [scanCount, unlockBadge]);

  const resetState = () => {
    setImageSrc(null);
    setImageFile(null);
    setVideoSrc(null);
    setVideoFile(null);
    setResult(null);
    setError(null);
    // Reset file input value to allow selecting the same file again
    if(fileInputRef.current) fileInputRef.current.value = "";
    if(videoInputRef.current) videoInputRef.current.value = "";
  }

  const handleModeChange = (newMode: 'image' | 'video') => {
      setMode(newMode);
      resetState();
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoSrc(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
      });
  }

  const handleImageClassify = useCallback(async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const classificationResult = await classifyWasteImage(base64Image, imageFile.type, language);
      setResult(classificationResult);
      addPoints(10);
      addClassificationToHistory(classificationResult);
      setScanCount(prev => prev + 1);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [imageFile, addPoints, language, addClassificationToHistory]);

  const handleVideoClassify = useCallback(async () => {
    if (!videoFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64Video = await fileToBase64(videoFile);
      const classificationResult = await classifyWasteVideo(base64Video, videoFile.type, language);
      setResult(classificationResult);
      addPoints(15);
      addClassificationToHistory(classificationResult);
      setScanCount(prev => prev + 1);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [videoFile, addPoints, language, addClassificationToHistory]);

  const triggerFileSelect = () => fileInputRef.current?.click();
  const triggerVideoSelect = () => videoInputRef.current?.click();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('classifierTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('classifierDescription')}</p>
      
      {!result && (
        <div className="flex justify-center mb-6 border-b">
          <button 
            onClick={() => handleModeChange('image')}
            className={`px-4 py-2 text-lg font-semibold border-b-2 transition-colors ${mode === 'image' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
          >
            {t('imageTab')}
          </button>
          <button 
            onClick={() => handleModeChange('video')}
            className={`px-4 py-2 text-lg font-semibold border-b-2 transition-colors ${mode === 'video' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
          >
            {t('videoTab')}
          </button>
        </div>
      )}
      
      {!result && (
        <Card className="p-6">
          {mode === 'image' && (
              <div className="flex flex-col items-center">
              <div 
                onClick={triggerFileSelect} 
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-50 transition-colors bg-cover bg-center"
                style={{ backgroundImage: imageSrc ? `url(${imageSrc})` : 'none' }}
              >
                {!imageSrc && (
                  <div className="text-center text-gray-500 p-4">
                    <CameraIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold">{t('uploadImage')}</p>
                    <p className="text-sm">Tap here to select a photo</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
    
              <button
                onClick={handleImageClassify}
                disabled={!imageSrc || loading}
                className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? t('analyzing') : t('classifyImage')}
              </button>
            </div>
          )}
          {mode === 'video' && (
              <div className="flex flex-col items-center">
              <div 
                onClick={triggerVideoSelect} 
                className="w-full h-64 bg-gray-900 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-800 transition-colors"
              >
                {videoSrc ? (
                  <video src={videoSrc} controls className="max-h-full max-w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    <VideoIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold">{t('uploadVideo')}</p>
                    <p className="text-sm">Tap here to select a video</p>
                  </div>
                )}
              </div>
              <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoChange} className="hidden" />
    
              <button
                onClick={handleVideoClassify}
                disabled={!videoSrc || loading}
                className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? t('analyzing') : t('classifyVideo')}
              </button>
            </div>
          )}
        </Card>
      )}

      {loading && <div className="mt-6"><Spinner /></div>}
      
      {error && <p className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
      
      {result && (
        <div className="mt-6 animate-fade-in">
          <ResultCard result={result}/>
          <button
              onClick={resetState}
              className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
             {t('classifyAnother')}
          </button>
        </div>
      )}
    </div>
  );
};

export default WasteClassifier;