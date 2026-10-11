import { useEffect, useState } from 'react';
import { ActionModal } from './components/actions/ActionModal';
import { BenchmarkDashboard } from './components/admin/BenchmarkDashboard';
import { DocumentManager } from './components/admin/DocumentManager';
import { GovernanceDashboard } from './components/admin/GovernanceDashboard';
import { ChatCanvas } from './components/chat/ChatCanvas';
import { KnowledgeGraphViewer } from './components/graph/KnowledgeGraphViewer';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProvenanceDrawer } from './components/provenance/ProvenanceDrawer';
import { fetchSpaces, sendQuery } from './services/api';
import { ActionRequest, Citation, KnowledgeSpace, QueryResponse } from './types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseDetails?: QueryResponse;
}

export function App() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'sources' | 'graph' | 'governance' | 'benchmark'>('chat');
  const [spaces, setSpaces] = useState<KnowledgeSpace[]>([]);
  const [activeSpace, setActiveSpace] = useState<string>('company-wide');
  const [strategy, setStrategy] = useState<string>('adaptive');
  const [researchMode, setResearchMode] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('employee');

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [currentCitations, setCurrentCitations] = useState<Citation[]>([]);
  const [selectedCitationIndex, setSelectedCitationIndex] = useState<number | null>(null);

  const [activeAction, setActiveAction] = useState<ActionRequest | null>(null);

  useEffect(() => {
    fetchSpaces()
      .then((data) => {
        setSpaces(data);
        if (data.length > 0) setActiveSpace(data[0].id);
      })
      .catch((err) => console.error('Failed to load spaces', err));
  }, []);

  const handleSendMessage = async (queryText: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendQuery({
        query: queryText,
        space_id: activeSpace,
        research_mode: researchMode,
        strategy: strategy,
        user_role: userRole,
      });

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        responseDetails: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentCitations(response.citations);
      if (response.citations.length > 0) {
        setDrawerOpen(true);
        setSelectedCitationIndex(0);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error retrieving enterprise knowledge: ${err.message || 'Connection failure'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCitation = (index: number) => {
    setSelectedCitationIndex(index);
    setDrawerOpen(true);
  };

  const currentSpaceObj = spaces.find((s) => s.id === activeSpace) || { name: 'All Knowledge' };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as any)}
        spaces={spaces}
        activeSpace={activeSpace}
        onSelectSpace={setActiveSpace}
        userRole={userRole}
        onSelectRole={setUserRole}
        onSelectPrompt={(p) => {
          setCurrentTab('chat');
          handleSendMessage(p);
        }}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          spaces={spaces}
          activeSpace={activeSpace}
          onSelectSpace={setActiveSpace}
          strategy={strategy}
          onChangeStrategy={setStrategy}
          researchMode={researchMode}
          onToggleResearchMode={setResearchMode}
          citationsCount={currentCitations.length}
          onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
          drawerOpen={drawerOpen}
        />

        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'chat' && (
            <ChatCanvas
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onSelectCitation={handleSelectCitation}
              onOpenActionModal={setActiveAction}
              researchMode={researchMode}
              activeSpaceName={currentSpaceObj.name}
            />
          )}

          {currentTab === 'sources' && <DocumentManager spaces={spaces} />}
          {currentTab === 'graph' && <KnowledgeGraphViewer />}
          {currentTab === 'governance' && <GovernanceDashboard />}
          {currentTab === 'benchmark' && <BenchmarkDashboard />}
        </main>
      </div>

      <ProvenanceDrawer
        isOpen={drawerOpen && currentTab === 'chat'}
        onClose={() => setDrawerOpen(false)}
        citations={currentCitations}
        selectedCitationIndex={selectedCitationIndex}
        onSelectCitation={setSelectedCitationIndex}
      />

      <ActionModal
        action={activeAction}
        onClose={() => setActiveAction(null)}
        onSuccess={() => {}}
      />
    </div>
  );
}

export default App;
