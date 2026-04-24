/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Upload, ImageIcon, Loader2, ArrowRight, Download, RefreshCw } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setMimeType(file.type);
      setResultImage(null); // Reset result when new image is uploaded
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStyleChange = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Mude o estilo da imagem, preservando a expressão facial e com um estilo de escritório.',
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        throw new Error('Nenhuma imagem foi retornada pelo modelo. Tente novamente com outra foto.');
      }

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar a imagem. O modelo de imagens pode estar temporariamente indisponível.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setImage(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans flex flex-col justify-center items-center p-6">
      <div className="max-w-5xl w-full">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              {/* Top abstract shapes (lamp/shade) */}
              <path d="M25 60 C35 30, 50 30, 55 50" stroke="#FEF08A" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M65 50 C70 30, 85 30, 95 60" stroke="#FEF08A" strokeWidth="4" fill="none" strokeLinecap="round" />
              
              {/* Glowing vertical bulbs */}
              <rect x="48" y="40" width="6" height="14" rx="3" fill="#FACC15" className="blur-[2px]" />
              <rect x="66" y="40" width="6" height="14" rx="3" fill="#FACC15" className="blur-[2px]" />
              <rect x="48" y="40" width="6" height="14" rx="3" fill="#FEF08A" />
              <rect x="66" y="40" width="6" height="14" rx="3" fill="#FEF08A" />

              {/* Glowing Center Circle */}
              <circle cx="60" cy="70" r="16" stroke="#EAB308" strokeWidth="6" fill="#171717" />
              <circle cx="60" cy="70" r="16" fill="#FACC15" className="blur-xl opacity-30" />

              {/* Letter N */}
              <path d="M25 100 L30 65 L50 95 L55 65" stroke="#FDE047" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Letter M */}
              <path d="M65 65 L70 95 L80 75 L90 95 L95 65" stroke="#171717" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M65 65 L70 95 L80 75 L90 95 L95 65" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-yellow-400 mb-3 hidden">IMGIA</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Transforme sua foto em um retrato profissional com cenário de escritório, preservando suas expressões faciais originais.
          </p>
        </div>

        <div className="bg-neutral-900 rounded-3xl shadow-xl shadow-yellow-500/5 overflow-hidden border border-neutral-800 p-8">
          
          {error && (
            <div className="mb-6 p-4 bg-red-950/30 text-red-400 rounded-xl text-sm font-medium border border-red-900 flex items-start gap-3">
              <span className="shrink-0 text-red-500 font-bold">⚠️</span>
              {error}
            </div>
          )}

          {!image ? (
            <label 
              className="flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed border-neutral-700 rounded-2xl bg-neutral-950 hover:bg-neutral-800 hover:border-yellow-500 transition-all cursor-pointer group"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-20 h-20 bg-black rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-neutral-800 group-hover:border-yellow-500/50">
                  <Upload className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="mb-2 text-xl font-semibold text-neutral-200">Clique para enviar</p>
                <p className="text-sm text-neutral-500">ou arraste a sua imagem aqui</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                {/* Original Image */}
                <div className="flex-1 w-full max-w-md flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider text-center">Foto Original</h3>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-sm relative group">
                    <img src={image} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={clearSelection} className="text-white text-xs font-medium hover:text-yellow-400 transition-colors flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Trocar foto
                      </button>
                    </div>
                  </div>
                </div>

                {/* Arrow or Loader */}
                <div className="flex items-center justify-center px-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center text-yellow-500">
                      <Loader2 className="w-10 h-10 animate-spin mb-2" />
                      <span className="text-xs font-semibold uppercase tracking-widest animate-pulse">Gerando...</span>
                    </div>
                  ) : resultImage ? (
                    <ArrowRight className="w-8 h-8 text-neutral-600 hidden md:block" />
                  ) : null}
                </div>

                {/* Result Image */}
                <div className="flex-1 w-full max-w-md flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider text-center">Versão Escritório</h3>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 border-dashed shadow-sm relative flex items-center justify-center">
                    {resultImage ? (
                      <div className="w-full h-full relative group">
                        <img src={resultImage} alt="Gerada" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                          <a href={resultImage} download="retrato_escritorio.png" className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-yellow-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-yellow-400/30 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Baixar
                          </a>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="text-neutral-500 flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                        <span className="text-sm">A mágica está acontecendo...</span>
                      </div>
                    ) : (
                      <div className="text-neutral-600 flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                        <span className="text-sm">Aguardando geração</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleStyleChange}
                  disabled={isLoading}
                  className={`
                    flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg
                    ${isLoading 
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none border border-neutral-700' 
                      : 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-yellow-500/20 hover:shadow-yellow-500/40 active:scale-95'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Processando
                    </>
                  ) : (
                    <>
                      ✨ Aplicar Estilo de Escritório
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
