'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/utils/supabase/client'

interface ResumeUploadProps {
  onUploadSuccess?: (data: any) => void
  onUploadError?: (error: string) => void
  className?: string
}

interface UploadState {
  uploading: boolean
  analyzing: boolean
  dragActive: boolean
  progress: number
  error: string | null
  success: boolean
  uploadedFile: File | null
}

export default function ResumeUpload({ onUploadSuccess, onUploadError, className = '' }: ResumeUploadProps) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    analyzing: false,
    dragActive: false,
    progress: 0,
    error: null,
    success: false,
    uploadedFile: null
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    const supportedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ]
    if (!supportedTypes.includes(file.type)) {
      const typeError = 'Please upload a DOCX or PDF file.'
      setState(prev => ({ ...prev, error: typeError, success: false }))
      onUploadError?.(typeError)
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeError = 'File size must be less than 10MB.'
      setState(prev => ({ ...prev, error: sizeError, success: false }))
      onUploadError?.(sizeError)
      return
    }

    setState(prev => ({ 
      ...prev, 
      uploading: true, 
      analyzing: false,
      error: null, 
      success: false, 
      uploadedFile: file,
      progress: 0 
    }))

    try {
      // Refresh session before upload to prevent timeouts
      console.log('🔄 Refreshing session before upload...')
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Authentication session expired. Please log in again.')
      }
      
      console.log('✅ Session validated, proceeding with upload...')

      const formData = new FormData()
      formData.append('file', file)

      // Create XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setState(prev => ({ ...prev, progress }))
          
          // Switch to analyzing state when upload is complete
          if (progress === 100) {
            setState(prev => ({ ...prev, uploading: false, analyzing: true }))
          }
        }
      })

      const response = await new Promise<Response>((resolve, reject) => {
        // Extended timeout for the entire request (3 minutes)
        const timeout = setTimeout(() => {
          reject(new Error('Upload timeout - request took too long'))
        }, 180000) // 3 minute timeout

        xhr.onload = () => {
          clearTimeout(timeout)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((headers, line) => {
                const [key, value] = line.split(': ')
                if (key && value) headers[key] = value
                return headers
              }, {} as Record<string, string>))
            }))
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
          }
        }
        
        xhr.onerror = () => {
          clearTimeout(timeout)
          reject(new Error('Network error'))
        }
        
        xhr.ontimeout = () => {
          clearTimeout(timeout)
          reject(new Error('Request timeout'))
        }
        
        xhr.open('POST', '/api/upload')
        xhr.timeout = 180000 // 3 minute timeout
        xhr.send(formData)
      })

      const result = await response.json()
      console.log('📤 Upload API response:', result)

      if (result.success) {
        setState(prev => ({ ...prev, analyzing: false, success: true, progress: 100 }))
        console.log('✅ Upload successful, calling onUploadSuccess with:', result.data)
        setTimeout(() => onUploadSuccess?.(result.data), 500)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      console.error('❌ Upload error:', errorMessage)
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        analyzing: false,
        error: errorMessage, 
        success: false,
        progress: 0
      }))
      onUploadError?.(errorMessage)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, dragActive: true }))
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, dragActive: false }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, dragActive: false }))
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleClick = () => {
    if (!state.uploading && !state.analyzing) {
      fileInputRef.current?.click()
    }
  }

  const resetUpload = () => {
    setState({
      uploading: false,
      analyzing: false,
      dragActive: false,
      progress: 0,
      error: null,
      success: false,
      uploadedFile: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer
          ${state.dragActive 
            ? 'border-indigo-400 bg-indigo-50' 
            : state.error 
            ? 'border-red-300 bg-red-50'
            : state.success
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
          ${state.uploading || state.analyzing ? 'cursor-not-allowed opacity-75' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".docx,.pdf"
          onChange={handleFileInputChange}
          disabled={state.uploading || state.analyzing}
        />

        <div className="text-center">
          {state.uploading ? (
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {state.uploadedFile ? `Uploading ${state.uploadedFile.name}...` : 'Processing...'}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${state.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{state.progress}% complete</p>
              </div>
            </div>
          ) : state.analyzing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Analyzing your resume...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Extracting information and structuring your data
                </p>
              </div>
            </div>
          ) : state.success ? (
            <div className="space-y-3">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <p className="text-sm font-medium text-green-900">Upload successful!</p>
                <p className="text-xs text-green-700">
                  {state.uploadedFile?.name} has been processed
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetUpload()
                  }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Upload another file
                </button>
              </div>
            </div>
          ) : state.error ? (
            <div className="space-y-3">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto" />
              <div>
                <p className="text-sm font-medium text-red-900">Upload failed</p>
                <p className="text-xs text-red-700">{state.error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetUpload()
                  }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop your resume here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports DOCX and PDF files up to 10MB
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>DOCX</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 