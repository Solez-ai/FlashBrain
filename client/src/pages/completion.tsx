import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Trophy, RotateCcw, ArrowLeft, Home, Sparkles } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Folder, Flashcard } from "@shared/schema";

export default function Completion() {
  const [, navigate] = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);
  
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

  const createStudySessionMutation = useMutation({
    mutationFn: (data: { folderId: number; totalCards: number; completedCards: number; duration: number; accuracy: number }) => 
      apiPost("/api/study-sessions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
    }
  });

  // Get real session stats from localStorage
  const getSessionStats = () => {
    const storedStats = localStorage.getItem('lastSessionStats');
    if (storedStats) {
      const stats = JSON.parse(storedStats);
      return {
        totalCards: stats.totalCards,
        completedCards: stats.completedCards,
        durationSeconds: stats.duration, // Raw seconds from useStudySession
        durationMinutes: Math.floor(stats.duration / 60), // Convert to minutes
        accuracy: stats.accuracy
      };
    }
    // Fallback if no stats available - but this shouldn't happen
    return {
      totalCards: flashcards.length,
      completedCards: 0,
      durationSeconds: 0,
      durationMinutes: 0,
      accuracy: 0
    };
  };

  const sessionStats = getSessionStats();

  useEffect(() => {
    // Create a study session record with real data
    const sessionData = {
      folderId,
      totalCards: sessionStats.totalCards,
      completedCards: sessionStats.completedCards,
      duration: sessionStats.durationSeconds, // Raw seconds for database storage
      accuracy: sessionStats.accuracy
    };
    
    createStudySessionMutation.mutate(sessionData);

    // Clear the stored stats after using them
    localStorage.removeItem('lastSessionStats');

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [folderId]);

  const handleRestartSession = () => {
    navigate(`/study/${folderId}`);
  };

  const handleBackToFlashcards = () => {
    navigate(`/flashcards/${folderId}`);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      <main className="px-4 py-8">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
            <Trophy className="text-yellow-400 h-10 w-10" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2 flex items-center justify-center">
            <Sparkles className="mr-2 h-6 w-6 text-yellow-400" />
            Great Work!
            <Sparkles className="ml-2 h-6 w-6 text-yellow-400" />
          </h2>
          <p className="text-white/80 text-lg mb-6">You've completed your study session</p>
          
          {/* Session Stats */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">Session Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-white text-2xl font-bold">{sessionStats.totalCards}</div>
                  <div className="text-white/70 text-sm">Cards Reviewed</div>
                </div>
                <div>
                  <div className="text-white text-2xl font-bold">{sessionStats.durationMinutes}m</div>
                  <div className="text-white/70 text-sm">Minutes</div>
                </div>
                <div>
                  <div className="text-white text-2xl font-bold">{sessionStats.accuracy}%</div>
                  <div className="text-white/70 text-sm">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivational Message */}
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-6 text-[#000000] bg-[#00000000]">
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
                <h3 className="font-semibold text-[#000000]">Keep Learning!</h3>
                <Sparkles className="h-5 w-5 text-yellow-400 ml-2" />
              </div>
              <p className="text-sm text-[#000000cc]">
                Consistency is key to mastering any subject. Great job on completing this session!
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 max-w-sm mx-auto">
            <Button
              onClick={handleRestartSession}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-semibold touch-btn transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Study Again
            </Button>
            <Button
              onClick={handleBackToFlashcards}
              variant="outline"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 py-4 px-6 rounded-xl font-semibold touch-btn transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Flashcards
            </Button>
            <Button
              onClick={handleBackToHome}
              variant="ghost"
              className="w-full text-white hover:bg-white/10 py-4 px-6 rounded-xl font-semibold touch-btn transition-all duration-300"
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
