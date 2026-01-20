'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmailSettings } from './EmailProviderCard';
import { SmsSettings } from './SmsProviderCard';

/**
 * 消息服务设置
 * 包含 Email 和 SMS 两个子 Tab
 */
export function MessageSettings() {
  const [subTab, setSubTab] = useState('email');

  return (
    <div className='space-y-4'>
      <div className='text-sm text-muted-foreground mb-4'>
        配置消息发送服务，用于发送邮件验证码、短信验证码等。
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value='email'>邮件服务</TabsTrigger>
          <TabsTrigger value='sms'>短信服务</TabsTrigger>
        </TabsList>

        <TabsContent value='email' className='mt-4'>
          <EmailSettings />
        </TabsContent>

        <TabsContent value='sms' className='mt-4'>
          <SmsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
