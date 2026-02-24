import { Bot } from 'lucide-react';
import { AiToggle } from '../components/AiToggle';
import { useChatbot } from '../context/ChatbotContext';

export function ChatbotHeader() {
    const { config, handleToggle, updateConfig } = useChatbot();

    return (
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden p-1">
            {/* Decorative background element for "AI" feel */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-4 relative">
                <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-blue-500/30 shadow-xl shadow-blue-500/5 group">
                    <Bot className="h-7 w-7 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                        Messenger Chatbot
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        AI-powered automation for Facebook Messenger
                    </p>
                </div>
            </div>

            <div className="relative">
                <AiToggle
                    enabled={config?.is_enabled || false}
                    onChange={handleToggle}
                    disabled={updateConfig.isPending}
                    description={updateConfig.isPending ? "Syncing..." : undefined}
                />
            </div>
        </div>
    );
}
