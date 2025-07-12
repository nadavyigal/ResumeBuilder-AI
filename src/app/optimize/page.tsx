'use client'

import DashboardLayout from '@/components/DashboardLayout';
import ResumeOptimizer from '@/components/ResumeOptimizer';

export default function OptimizePage() {
  return (
    <DashboardLayout 
      title="AI Resume Optimizer" 
      description="Optimize your resume for specific job descriptions using AI-powered analysis"
    >
      <ResumeOptimizer />
    </DashboardLayout>
  );
} 