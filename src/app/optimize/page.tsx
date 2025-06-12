import { Metadata } from 'next';
import ResumeOptimizer from '@/components/ResumeOptimizer';

export const metadata: Metadata = {
  title: 'AI Resume Optimizer | ResumeBuilder AI',
  description: 'Optimize your resume for specific job descriptions using AI-powered analysis and keyword matching.',
};

export default function OptimizePage() {
  return <ResumeOptimizer />;
} 