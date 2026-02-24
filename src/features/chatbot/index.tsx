import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Workflow } from 'lucide-react';

// Context
import { ChatbotProvider, useChatbot } from './context/ChatbotContext';

// Sections
import { ChatbotHeader } from './sections/ChatbotHeader';
import { SettingsTab } from './sections/SettingsTab';
import { FlowsTab } from './sections/FlowsTab';

// Components
import { FlowEditDialog } from './components/FlowEditDialog';

function ChatbotPageContent() {
    const { configLoading } = useChatbot();

    if (configLoading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="animate-spin w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full" />
            <p className="text-xs font-medium text-muted-foreground tracking-tight uppercase">Đang tải Chatbot...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 min-h-screen">
            <ChatbotHeader />

            <Tabs defaultValue="flows" className="space-y-8">
                <TabsList className="bg-muted p-1 rounded-xl border border-border inline-flex">
                    <TabsTrigger value="flows" className="data-[state=active]:bg-card rounded-lg gap-2.5 px-6 py-2.5 font-bold transition-all">
                        <Workflow className="h-4 w-4" /> Flow Builder
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-card rounded-lg gap-2.5 px-6 py-2.5 font-bold transition-all">
                        <Settings className="h-4 w-4" /> Cài đặt
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <SettingsTab />
                </TabsContent>

                <TabsContent value="flows" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <FlowsTab />
                </TabsContent>
            </Tabs>

            <FlowEditDialog />
        </div>
    );
}

export default function ChatbotPage() {
    return (
        <ChatbotProvider>
            <ChatbotPageContent />
        </ChatbotProvider>
    );
}
