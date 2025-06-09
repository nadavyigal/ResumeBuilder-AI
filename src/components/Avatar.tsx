import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AvatarProps {
  user: User
  profile: Profile | null
  size?: number
  onUpload?: (url: string) => void
}

export function Avatar({ user, profile, size = 150, onUpload }: AvatarProps) {
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
  const displayName = profile?.full_name || user.email || 'User'

  return (
    <div className="relative">
      <div className="relative aspect-square overflow-hidden rounded-full">
        <Image
          src={avatarUrl}
          alt={displayName}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      {onUpload && (
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              if (!e.target.files || e.target.files.length === 0) return
              const file = e.target.files[0]
              const fileExt = file.name.split('.').pop()
              const filePath = `${user.id}/avatar.${fileExt}`

              // TODO: Implement file upload to Supabase Storage
              // const { error: uploadError } = await supabase.storage
              //   .from('avatars')
              //   .upload(filePath, file, { upsert: true })

              // if (uploadError) {
              //   console.error('Error uploading avatar:', uploadError.message)
              //   return
              // }

              // const { data: { publicUrl } } = supabase.storage
              //   .from('avatars')
              //   .getPublicUrl(filePath)

              // onUpload(publicUrl)
            }}
          />
        </label>
      )}
    </div>
  )
} 