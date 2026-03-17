import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Workflow, Gift } from "lucide-react";

// Context
import { ChatbotProvider, useChatbot } from "./context/ChatbotContext";

// Sections
import { ChatbotHeader } from "./sections/ChatbotHeader";
import { SettingsTab } from "./sections/SettingsTab";
import { FlowsTab } from "./sections/FlowsTab";
import { EventsTab } from "./sections/EventsTab";

// Components
import { FlowEditDialog } from "./components/FlowEditDialog";

const TAB_CONFIG = [
  {
    value: "flows",
    label: "Flow Builder",
    icon: Workflow,
    component: <FlowsTab />,
  },
  {
    value: "events",
    label: "Event Builder",
    icon: Gift,
    component: <EventsTab />,
  },
  {
    value: "settings",
    label: "Cài đặt",
    icon: Settings,
    component: <SettingsTab />,
  },
];

const tabTriggerClass = `
relative flex items-center gap-2.5 px-5 py-4 rounded-xl text-sm font-semibold
text-muted-foreground transition-all duration-300

hover:text-foreground hover:bg-white/40

data-[state=active]:text-foreground
`;

const tabContentClass =
  "animate-in fade-in slide-in-from-bottom-2 duration-500";

function ChatbotPageContent() {
  const { configLoading } = useChatbot();

  const [activeTab, setActiveTab] = useState("flows");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    const indicator = indicatorRef.current;

    if (!el || !indicator) return;

    indicator.style.width = `${el.offsetWidth}px`;
    indicator.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [activeTab]);

  if (configLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full" />
        <p className="text-xs font-medium text-muted-foreground tracking-tight uppercase">
          Đang tải Chatbot...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-b-surface1">
      <div className="relative z-10 p-4 md:p-8 mx-auto space-y-10 min-h-screen">
        <ChatbotHeader />

        <Tabs
          defaultValue="flows"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="relative bg-muted/60 backdrop-blur-xl p-1.5 h-12 rounded-2xl border border-border inline-flex shadow-sm">

            {/* Sliding Active Indicator */}
            <div
              ref={indicatorRef}
              className="absolute top-1.5 left-0.5 h-[calc(100%-12px)] bg-white rounded-xl shadow-sm transition-all duration-300"
            />

            {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                ref={(el) => {
                  tabRefs.current[value] = el;
                }}
                className={tabTriggerClass}
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_CONFIG.map(({ value, component }) => (
            <TabsContent key={value} value={value} className={tabContentClass}>
              {component}
            </TabsContent>
          ))}
        </Tabs>

        <FlowEditDialog />
      </div>
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