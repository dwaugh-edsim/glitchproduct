'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, GraduationCap, FileText, BarChart3, Settings, Lock, Save, FolderOpen, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple marked parser wrapper (since we import marked in script)
const parseMarkdown = (content: string) => {
  if (typeof window !== 'undefined' && (window as any).marked) {
    return (window as any).marked.parse(content);
  }
  return content;
};

export default function MarkingTool() {
  const [isLocked, setIsLocked] = useState(true);
  const [assignment, setAssignment] = useState('');
  const [rubric, setRubric] = useState('');
  const [guidance, setGuidance] = useState('');
  const [studentWorks, setStudentWorks] = useState<{ name: string; text: string }[]>([]);
  const [redactNames, setRedactNames] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [modelA, setModelA] = useState('mistralai/mistral-nemo');
  const [modelB, setModelB] = useState('allenai/molmo-2-8b:free');
  const [modelC, setModelC] = useState('cognitivecomputations/dolphin-mistral-24b-venice-edition:free');

  // Login Logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const u = formData.get('username') as string;
    const p = formData.get('password') as string;
    
    // Simple mock hash/check for demo
    if (u === 'dwaugh' && p === 'dlwlll') {
      setIsLocked(false);
    } else {
      alert('Invalid credentials');
    }
  };

  // API Call Wrapper
  const callLLM = async (message: string, model: string) => {
    let provider = 'openrouter';
    if (model.includes('glm')) provider = 'zai';
    if (model.includes('minimax')) provider = 'minimax';

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model, provider }),
    });
    return await res.json();
  };

  // Marking Flow
  const processStudent = async (student: { name: string; text: string }) => {
    const prompt = `Mark student: ${student.name}. Work: ${student.text}. Assignment: ${assignment}. Rubric: ${rubric}. Guidance: ${guidance}`;
    
    // Step 1: Model A
    const resA = await callLLM(prompt, modelA);
    const feedbackA = resA.choices?.[0]?.message?.content || 'Error marking';

    // Step 2: Model B
    const resB = await callLLM(prompt, modelB);
    const feedbackB = resB.choices?.[0]?.message?.content || 'Error marking';

    // Step 3: Moderation
    const modPrompt = `Moderator: Compare Teacher A and Teacher B. \n\nA: ${feedbackA}\n\nB: ${feedbackB}`;
    const resMod = await callLLM(modPrompt, modelC);
    const finalFeedback = resMod.choices?.[0]?.message?.content || 'Moderation failed';

    return { name: student.name, feedbackA, feedbackB, finalFeedback };
  };

  const startBatch = async () => {
    setIsProcessing(true);
    const newResults = [];
    for (const student of studentWorks) {
      const result = await processStudent(student);
      newResults.push(result);
      setResults(prev => [result, ...prev]);
    }
    setIsProcessing(false);
  };

  if (isLocked) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="glass-card max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-display">Secure Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="username" type="text" placeholder="Username" className="input-field" required />
            <input name="password" type="password" placeholder="Password" className="input-field" required />
            <button type="submit" className="btn-primary w-full">Unlock Tool</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            GLITCH<span className="text-primary">PRODUCT</span>
          </h1>
          <p className="text-slate-400">AI-Powered Assessment & Moderation</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2"><Settings size={18} /> Settings</button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FileText size={20} /> Assignment Context
              </div>
              <textarea 
                className="input-field min-h-[150px]" 
                value={assignment}
                onChange={(e) => setAssignment(e.target.value)}
                placeholder="What are the students supposed to do?"
              />
            </div>
            <div className="glass-card space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <BarChart3 size={20} /> Grading Rubric
              </div>
              <textarea 
                className="input-field min-h-[150px]" 
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="How should they be graded?"
              />
            </div>
          </div>

          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <GraduationCap size={20} /> Student Submissions
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" checked={redactNames} onChange={(e) => setRedactNames(e.target.checked)} />
                Redact Identities
              </label>
            </div>
            <div className="upload-zone min-h-[200px] flex flex-col items-center justify-center gap-4">
              <Upload className="w-12 h-12 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-200">Drop student work here</p>
                <p className="text-sm text-slate-500">Supports .docx, .pdf, .txt</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentWorks.map((work, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm">
                  <span className="truncate">{work.name}</span>
                  <button className="text-red-400">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="space-y-6">
          <div className="glass-card space-y-6">
            <h3 className="font-bold border-b border-white/5 pb-2">Teacher Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Teacher A</label>
                <select className="input-field py-2" value={modelA} onChange={e => setModelA(e.target.value)}>
                  <option value="mistralai/mistral-nemo">Mistral Nemo</option>
                  <option value="openai/gpt-4o">GPT-4o</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Teacher B</label>
                <select className="input-field py-2" value={modelB} onChange={e => setModelB(e.target.value)}>
                  <option value="allenai/molmo-2-8b:free">Molmo 2 (Free)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Moderator</label>
                <select className="input-field py-2" value={modelC} onChange={e => setModelC(e.target.value)}>
                  <option value="cognitivecomputations/dolphin-mistral-24b-venice-edition:free">Dolphin Mistral</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <button 
                onClick={startBatch}
                disabled={isProcessing}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Play size={18} />}
                Generate Assessments
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary py-3 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                <button className="btn-secondary py-3 flex items-center justify-center gap-2"><FolderOpen size={16} /> Load</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Results Section */}
      {results.length > 0 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assessment Log</h2>
            <button className="btn-secondary text-sm">Download Full Report</button>
          </div>
          <div className="space-y-8">
            {results.map((res, i) => (
              <div key={i} className="glass-card space-y-4 border-l-4 border-l-primary">
                <h3 className="text-xl font-bold text-accent">{res.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 text-sm italic">
                  <div className="space-y-2">
                    <p className="font-bold uppercase text-primary">Teacher A Feedback</p>
                    <div className="prose prose-invert prose-sm">{res.feedbackA}</div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold uppercase text-primary">Teacher B Feedback</p>
                    <div className="prose prose-invert prose-sm">{res.feedbackB}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="font-bold uppercase text-accent mb-2">Final Moderated Result</p>
                  <div className="prose prose-invert max-w-none">{res.finalFeedback}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
