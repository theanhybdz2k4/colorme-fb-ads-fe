import { Bot } from 'lucide-react';
import { AiToggle } from '../components/AiToggle';
import { useChatbot } from '../context/ChatbotContext';

export function ChatbotHeader() {
    const { config, handleToggle, updateConfig } = useChatbot();

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-1">
            <div className="flex items-center gap-4 relative">
                <div className="p-3 rounded-xl bg-muted border border-border">
                    <Bot className="h-7 w-7 text-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Messenger Chatbot
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Automation for Facebook Messenger
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
