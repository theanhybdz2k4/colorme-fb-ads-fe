import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import {
    useChatbotConfig,
    useUpdateChatbotConfig,
    useChatbotFlows,
    useSaveChatbotFlow,
    useDeleteChatbotFlow,
    useTestChatbot,
} from '@/hooks/useChatbot';
import type { ChatbotFlow, ChatbotConfig } from '@/types/chatbot.types';

interface ChatbotContextType {
    config: ChatbotConfig | undefined;
    configLoading: boolean;
    updateConfig: any;
    flows: ChatbotFlow[] | undefined;
    flowsLoading: boolean;
    saveFlow: any;
    deleteFlow: any;
    testChatbot: any;

    // UI State
    editingFlow: Partial<ChatbotFlow> | null;
    setEditingFlow: (flow: Partial<ChatbotFlow> | null) => void;
    showDialog: boolean;
    setShowDialog: (show: boolean) => void;
    testPsid: string;
    setTestPsid: (psid: string) => void;
    newPsid: string;
    setNewPsid: (psid: string) => void;

    // Handlers
    handleToggle: () => Promise<void>;
    handleTestModeToggle: () => Promise<void>;
    handleAddPsid: () => Promise<void>;
    handleRemovePsid: (psid: string) => Promise<void>;
    handleTest: () => Promise<void>;
    handleSaveFlow: () => Promise<void>;
    handleDeleteFlow: (id: number) => Promise<void>;
    handleToggleFlow: (flow: ChatbotFlow) => Promise<void>;

    openEdit: (flow?: ChatbotFlow) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
    // Queries & Mutations
    const { data: config, isLoading: configLoading } = useChatbotConfig();
    const updateConfig = useUpdateChatbotConfig();
    const { data: flows, isLoading: flowsLoading } = useChatbotFlows();
    const saveFlow = useSaveChatbotFlow();
    const deleteFlow = useDeleteChatbotFlow();
    const testChatbot = useTestChatbot();

    // Local State
    const [editingFlow, setEditingFlow] = useState<Partial<ChatbotFlow> | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [testPsid, setTestPsid] = useState('7302212653229178');
    const [newPsid, setNewPsid] = useState('');

    // Toggle chatbot enabled
    const handleToggle = async () => {
        if (!config) return;
        try {
            await updateConfig.mutateAsync({ ...config, is_enabled: !config.is_enabled });
            toast.success(config.is_enabled ? 'Đã tắt chatbot' : 'Đã bật chatbot');
        } catch (e: any) {
            toast.error('Lỗi: ' + e.message);
        }
    };

    // Toggle test mode
    const handleTestModeToggle = async () => {
        if (!config) return;
        try {
            await updateConfig.mutateAsync({ ...config, test_mode: !config.test_mode });
            toast.success(config.test_mode ? 'Đã tắt chế độ test' : 'Đã bật chế độ test');
        } catch (e: any) {
            toast.error('Lỗi: ' + e.message);
        }
    };

    // Add PSID
    const handleAddPsid = async () => {
        if (!config || !newPsid.trim()) return;
        const updated = [...(config.test_psids || []), newPsid.trim()];
        try {
            await updateConfig.mutateAsync({ ...config, test_psids: updated });
            setNewPsid('');
            toast.success('Đã thêm PSID');
        } catch (e: any) { toast.error('Lỗi: ' + e.message); }
    };

    // Remove PSID
    const handleRemovePsid = async (psid: string) => {
        if (!config) return;
        const updated = (config.test_psids || []).filter(p => p !== psid);
        try {
            await updateConfig.mutateAsync({ ...config, test_psids: updated });
            toast.success('Đã xóa PSID');
        } catch (e: any) { toast.error('Lỗi: ' + e.message); }
    };

    // Test send
    const handleTest = async () => {
        try {
            await testChatbot.mutateAsync({ psid: testPsid });
            toast.success('Đã gửi test message!');
        } catch (e: any) { toast.error('Lỗi: ' + e.message); }
    };

    // Save flow
    const handleSaveFlow = async () => {
        if (!editingFlow?.flow_key || !editingFlow?.display_name) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        try {
            await saveFlow.mutateAsync(editingFlow);
            setShowDialog(false);
            setEditingFlow(null);
            toast.success('Đã lưu flow!');
        } catch (e: any) { toast.error('Lỗi: ' + e.message); }
    };

    // Delete flow
    const handleDeleteFlow = async (id: number) => {
        if (!confirm('Xóa flow này?')) return;
        try {
            await deleteFlow.mutateAsync(id);
            toast.success('Đã xóa flow');
        } catch (e: any) { toast.error('Lỗi: ' + e.message); }
    };

    // Toggle flow active state
    const handleToggleFlow = async (flow: ChatbotFlow) => {
        try {
            await saveFlow.mutateAsync({ ...flow, is_active: !flow.is_active });
            toast.success(flow.is_active ? `Đã tắt "${flow.display_name}"` : `Đã bật "${flow.display_name}"`);
        } catch (e: any) { toast.error('Lỗi: ' + e.message); }
    };



    // removed handleSaveCampaign, handleDeleteCampaign, handleToggleCampaign

    // Open edit dialog
    const openEdit = (flow?: ChatbotFlow) => {
        if (flow) {
            setEditingFlow({ ...flow });
        } else {
            setEditingFlow({
                flow_key: '',
                display_name: '',
                message_type: 'text',
                content: { text: '' },

                trigger_payloads: [],
                trigger_keywords: [],
                is_entry_point: false,
                is_daily_welcome: false,
                sort_order: (flows?.length || 0) * 10,
                is_active: true,
            });
        }
        setShowDialog(true);
    };

    const value = {
        config,
        configLoading,
        updateConfig,
        flows,
        flowsLoading,
        saveFlow,
        deleteFlow,
        testChatbot,
        editingFlow,
        setEditingFlow,
        showDialog,
        setShowDialog,
        testPsid,
        setTestPsid,
        newPsid,
        setNewPsid,
        handleToggle,
        handleTestModeToggle,
        handleAddPsid,
        handleRemovePsid,
        handleTest,
        handleSaveFlow,
        handleDeleteFlow,
        handleToggleFlow,

        openEdit
    };

    return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (context === undefined) {
        throw new Error('useChatbot must be used within a ChatbotProvider');
    }
    return context;
};
