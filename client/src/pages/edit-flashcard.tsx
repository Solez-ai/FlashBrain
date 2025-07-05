import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Save, ArrowLeft } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FlashcardComponent from "@/components/flashcard";
import { apiGet, apiPut } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Flashcard } from "@shared/schema";

const CARD_STYLES = [
  { name: "Yellow", value: "yellow" },
  { name: "Pink", value: "pink" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "White", value: "white" },
];

export default function EditFlashcard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cardStyle, setCardStyle] = useState("white");
  const [previewFlipped, setPreviewFlipped] = useState(false);
  
  // Extract flashcardId from URL
  const flashcardId = parseInt(window.location.pathname.split('/')[2]);
  
  const { data: flashcard, isLoading } = useQuery<Flashcard>({
    queryKey: ["/api/flashcards", flashcardId],
    queryFn: async () => {
      const categories = await apiGet("/api/categories");
      for (const category of categories) {
        const folders = await apiGet(`/api/folders/category/${category.id}`);
        for (const folder of folders) {
          const flashcards = await apiGet(`/api/flashcards/folder/${folder.id}`);
          const foundFlashcard = flashcards.find((f: Flashcard) => f.id === flashcardId);
          if (foundFlashcard) return foundFlashcard;
        }
      }
      return null;
    }
  });

  // Set form values when flashcard data loads
  useEffect(() => {
    if (flashcard) {
      setQuestion(flashcard.question);
      setAnswer(flashcard.answer);
      setCardStyle(flashcard.cardStyle);
    }
  }, [flashcard]);

  const updateFlashcardMutation = useMutation({
    mutationFn: (data: { question: string; answer: string; cardStyle: string }) => 
      apiPut(`/api/flashcards/${flashcardId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      toast({
        title: "Success",
        description: "Flashcard updated successfully!",
      });
      navigate(`/flashcards/${flashcard?.folderId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update flashcard. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleUpdateFlashcard = async () => {
    if (!(question || "").trim() || !(answer || "").trim()) {
      toast({
        title: "Error",
        description: "Both question and answer are required.",
        variant: "destructive",
      });
      return;
    }
    
    updateFlashcardMutation.mutate({
      question: (question || "").trim(),
      answer: (answer || "").trim(),
      cardStyle
    });
  };

  // Create preview flashcard
  const previewFlashcard: Flashcard = {
    id: flashcardId,
    question: question || "Your question will appear here...",
    answer: answer || "Your answer will appear here...",
    folderId: flashcard?.folderId || 0,
    cardStyle,
    createdAt: flashcard?.createdAt || new Date()
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animate-fade-in">
        <NavigationHeader title="Loading..." showBack backTo="/" />
        <div className="px-4 pt-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-20 bg-white/20 rounded"></div>
                <div className="h-20 bg-white/20 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!flashcard) {
    return (
      <div className="min-h-screen animate-fade-in">
        <NavigationHeader title="Flashcard Not Found" showBack backTo="/" />
        <div className="px-4 pt-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-white font-semibold mb-2">Flashcard Not Found</h3>
              <p className="text-white/70 mb-4">
                The flashcard you're looking for doesn't exist.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <NavigationHeader 
        title="Edit Flashcard" 
        showBack 
        backTo={`/flashcards/${flashcard.folderId}`}
      />
      
      <main className="px-4 pb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Card Style Selection */}
              <div>
                <Label className="text-white text-sm font-medium mb-3 block">Card Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {CARD_STYLES.map((style) => (
                    <Button
                      key={style.value}
                      onClick={() => setCardStyle(style.value)}
                      variant={cardStyle === style.value ? "default" : "outline"}
                      className={`p-3 h-auto ${
                        style.value === "yellow" ? "bg-yellow-200 border-yellow-400 text-yellow-900 hover:bg-yellow-300" :
                        style.value === "pink" ? "bg-pink-200 border-pink-400 text-pink-900 hover:bg-pink-300" :
                        style.value === "blue" ? "bg-blue-200 border-blue-400 text-blue-900 hover:bg-blue-300" :
                        style.value === "green" ? "bg-green-200 border-green-400 text-green-900 hover:bg-green-300" :
                        "bg-white border-gray-400 text-gray-900 hover:bg-gray-100"
                      } ${cardStyle === style.value ? "ring-2 ring-white" : "opacity-70"}`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">{style.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Card Front */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Question/Front Side
                </Label>
                <Textarea
                  value={question || ""}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full p-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-white/20 focus:border-white/60 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-white/60 text-xs mt-1">
                  {(question || "").length}/200 characters
                </div>
              </div>

              {/* Card Back */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Answer/Back Side
                </Label>
                <Textarea
                  value={answer || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full p-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-white/20 focus:border-white/60 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-white/60 text-xs mt-1">
                  {(answer || "").length}/200 characters
                </div>
              </div>

              {/* Card Preview */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Preview</Label>
                <FlashcardComponent
                  flashcard={previewFlashcard}
                  isFlipped={previewFlipped}
                  onFlip={() => setPreviewFlipped(!previewFlipped)}
                  className="h-32"
                />
                <p className="text-white/60 text-xs text-center mt-2">Tap to flip</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => navigate(`/flashcards/${flashcard.folderId}`)}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 py-3 px-4 rounded-xl font-semibold touch-btn"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateFlashcard}
                  disabled={!(question || "").trim() || !(answer || "").trim() || updateFlashcardMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold touch-btn"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}