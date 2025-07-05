import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Folders from "@/pages/folders";
import Flashcards from "@/pages/flashcards";
import CreateFlashcard from "@/pages/create-flashcard";
import EditFlashcard from "@/pages/edit-flashcard";
import CreateAI from "@/pages/create-ai";
import StudySession from "@/pages/study-session";
import Completion from "@/pages/completion";
import GradientBackground from "@/components/gradient-background";
import { AppStateProvider } from "@/lib/store.tsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/folders/:categoryId" component={Folders} />
      <Route path="/flashcards/:folderId" component={Flashcards} />
      <Route path="/create-flashcard/:folderId" component={CreateFlashcard} />
      <Route path="/edit-flashcard/:flashcardId" component={EditFlashcard} />
      <Route path="/create-ai" component={CreateAI} />
      <Route path="/study/:folderId" component={StudySession} />
      <Route path="/completion/:folderId" component={Completion} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <div className="min-h-screen">
            <GradientBackground />
            <div className="relative z-10 safe-area">
              <Toaster />
              <Router />
            </div>
          </div>
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}

export default App;
