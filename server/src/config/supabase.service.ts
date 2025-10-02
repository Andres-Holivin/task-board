import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from './env';

@Injectable()
export class SupabaseService {
    private readonly supabase: SupabaseClient;

    constructor(private readonly configService: ConfigService<Env, true>) {
        const supabaseUrl = this.configService.get('SUPABASE_URL', { infer: true });
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true });

        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }

    getAuthClient(): SupabaseClient {
        const supabaseUrl = this.configService.get('SUPABASE_URL', { infer: true });
        const supabaseAnonKey = this.configService.get('SUPABASE_ANON_KEY', { infer: true });

        return createClient(supabaseUrl, supabaseAnonKey);
    }
}