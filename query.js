import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('leads').select('customer_name, messages').ilike('customer_name', '%Trần Thế Anh%').order('last_message_at', { ascending: false }).limit(1);
if (error) console.error(error);
else {
    const messages = data[0].messages || [];
    const emptyMsgs = messages.filter(m => m.message_content === '(Tin nhắn hệ thống / Không có nội dung)' || !m.message_content || m.attachments);
    console.log(JSON.stringify(emptyMsgs.slice(-5), null, 2));
}
