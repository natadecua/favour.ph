import { createClient } from '@supabase/supabase-js'
import {
  UPLOAD_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from '@favour/shared'

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

export const UploadsService = {
  async signUploadUrl(params: {
    fileName: string
    fileType: string
    fileSize: number
    userId: string
  }): Promise<{ signedUrl: string; path: string }> {
    if (!ALLOWED_IMAGE_TYPES.includes(params.fileType as any)) {
      throw Object.assign(new Error('Invalid file type'), { statusCode: 400 })
    }
    if (params.fileSize > UPLOAD_MAX_SIZE_BYTES) {
      throw Object.assign(new Error('File too large (max 5MB)'), { statusCode: 400 })
    }

    const ext = params.fileName.split('.').pop() ?? 'jpg'
    const path = `providers/${params.userId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('provider-photos')
      .createSignedUploadUrl(path)

    if (error || !data) {
      throw Object.assign(new Error('Could not generate upload URL'), { statusCode: 500 })
    }

    return { signedUrl: data.signedUrl, path }
  },
}
