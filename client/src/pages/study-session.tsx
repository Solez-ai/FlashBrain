import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { X, Settings, ChevronLeft, ChevronRight, RotateCcw, Pause, Play } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FlashcardComponent from "@/components/flashcard";
import { useStudySession } from "@/hooks/use-study-session";
import { apiGet } from "@/lib/api";
import type { Flashcard, Folder } from "@shared/schema";

export default function StudySession() {
  const [, navigate] = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  
  // Extract folderId from URL
  const folderId = parseInt(window.location.pathname.split('/')[2]);
  
  const { data: folder } = useQuery<Folder>({
    queryKey: ["/api/folders", folderId],
    queryFn: async () => {
      const categories = await apiGet("/api/categories");
      for (const category of categories) {
        const folders = await apiGet(`/api/folders/category/${category.id}`);
        const foundFolder = folders.find((f: Folder) => f.id === folderId);
        if (foundFolder) return foundFolder;
      }
      return null;
    }
  });

  const { data: flashcards = [] } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", folderId],
    queryFn: () => apiGet(`/api/flashcards/folder/${folderId}`)
  });

  const {
    currentIndex,
    isFlipped,
    isAutoPlay,
    autoPlayInterval,
    startTime,
    nextCard,
    previousCard,
    flipCard,
    setAutoPlay,
    pauseAutoPlay,
    resetSession
  } = useStudySession(flashcards);

  const handleExitSession = () => {
    navigate(`/completion/${folderId}`);
  };

  const handleSetAutoPlay = (seconds: number) => {
    setAutoPlay(seconds);
    setShowSettings(false);
  };

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  if (!currentCard) {
    return (
      <div className="min-h-screen animate-fade-in">
        <NavigationHeader 
          title="Study Session" 
          showBack 
          backTo={`/flashcards/${folderId}`}
        />
        <main className="px-4 pb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-white font-semibold mb-2">No Flashcards Available</h3>
              <p className="text-white/70 mb-4">
                Add some flashcards to this folder to start studying.
              </p>
              <Button
                onClick={() => navigate(`/create-flashcard/${folderId}`)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Create Flashcards
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Study Header */}
      <header className="px-4 py-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleExitSession}
            variant="ghost"
            size="icon"
            className="touch-btn w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-white font-semibold">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
            <Progress 
              value={progress} 
              className="w-32 mt-1 bg-white/20"
            />
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="icon"
            className="touch-btn w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 pb-8">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">Study Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Auto-play</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleSetAutoPlay(3)}
                      variant={autoPlayInterval === 3 ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      3s
                    </Button>
                    <Button
                      onClick={() => handleSetAutoPlay(5)}
                      variant={autoPlayInterval === 5 ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      5s
                    </Button>
                    <Button
                      onClick={() => handleSetAutoPlay(10)}
                      variant={autoPlayInterval === 10 ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      10s
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Controls</span>
                  <div className="flex items-center space-x-2">
                    {isAutoPlay ? (
                      <Button
                        onClick={pauseAutoPlay}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Pause className="mr-1 h-3 w-3" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={resetSession}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flashcard Display */}
        <div className="flex-1 flex items-center justify-center px-4 mb-8">
          <FlashcardComponent
            flashcard={currentCard}
            isFlipped={isFlipped}
            onFlip={flipCard}
            className="w-full max-w-sm h-64"
          />
        </div>

        {/* Study Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={previousCard}
                disabled={currentIndex === 0}
                variant="ghost"
                size="icon"
                className="touch-btn w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="text-center">
                <p className="text-white/80 text-sm">Tap card to flip</p>
                <Button
                  onClick={flipCard}
                  variant="ghost"
                  className="text-white bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg text-sm font-medium mt-2"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Flip Card
                </Button>
              </div>
              <Button
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1}
                variant="ghost"
                size="icon"
                className="touch-btn w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Auto-play Controls */}
            <div className="flex items-center justify-center space-x-2">
              <Button
                onClick={() => handleSetAutoPlay(3)}
                variant={autoPlayInterval === 3 ? "default" : "outline"}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                3s
              </Button>
              <Button
                onClick={() => handleSetAutoPlay(5)}
                variant={autoPlayInterval === 5 ? "default" : "outline"}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                5s
              </Button>
              <Button
                onClick={() => handleSetAutoPlay(10)}
                variant={autoPlayInterval === 10 ? "default" : "outline"}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                10s
              </Button>
              {isAutoPlay ? (
                <Button
                  onClick={pauseAutoPlay}
                  className="bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  <Pause className="mr-1 h-3 w-3" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={() => handleSetAutoPlay(5)}
                  className="bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  <Play className="mr-1 h-3 w-3" />
                  Auto
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
