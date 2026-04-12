import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucket = 'project-files';

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Supabase config missing');
    this.supabase = createClient(url, key);
  }

  async upload(file: Express.Multer.File, path: string) {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async remove(path: string) {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw new Error(error.message);
  }
}
