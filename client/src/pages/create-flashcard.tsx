import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, ArrowLeft } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FlashcardComponent from "@/components/flashcard";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Folder, Flashcard } from "@shared/schema";

const CARD_STYLES = [
  { name: "Yellow", value: "yellow" },
  { name: "Pink", value: "pink" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "White", value: "white" },
];

export default function CreateFlashcard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cardStyle, setCardStyle] = useState("white");
  const [previewFlipped, setPreviewFlipped] = useState(false);
  
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

  const createFlashcardMutation = useMutation({
    mutationFn: (data: { question: string; answer: string; folderId: number; cardStyle: string }) => 
      apiPost("/api/flashcards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards", folderId] });
      toast({
        title: "Success",
        description: "Flashcard created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateFlashcard = async (continueCreating = false) => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Error",
        description: "Both question and answer are required.",
        variant: "destructive",
      });
      return;
    }
    
    await createFlashcardMutation.mutateAsync({
      question: question.trim(),
      answer: answer.trim(),
      folderId,
      cardStyle
    });

    if (continueCreating) {
      // Reset form for next card
      setQuestion("");
      setAnswer("");
      setCardStyle("white");
      setPreviewFlipped(false);
    } else {
      // Navigate back to flashcards list
      navigate(`/flashcards/${folderId}`);
    }
  };

  const getTextSize = (text: string) => {
    const length = text.length;
    if (length < 20) return "text-lg";
    if (length < 40) return "text-base";
    return "text-sm";
  };

  // Create preview flashcard
  const previewFlashcard: Flashcard = {
    id: 0,
    question: question || "Your question will appear here...",
    answer: answer || "Your answer will appear here...",
    folderId,
    cardStyle,
    createdAt: new Date()
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <NavigationHeader 
        title="Create Flashcard" 
        showBack 
        backTo={`/flashcards/${folderId}`}
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
                        style.value === "yellow" ? "bg-yellow-200 border-yellow-300 text-yellow-800" :
                        style.value === "pink" ? "bg-pink-200 border-pink-300 text-pink-800" :
                        style.value === "blue" ? "bg-blue-200 border-blue-300 text-blue-800" :
                        style.value === "green" ? "bg-green-200 border-green-300 text-green-800" :
                        "bg-white border-gray-300 text-gray-800"
                      } ${cardStyle === style.value ? "" : "opacity-70"}`}
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
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full p-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-white/20 focus:border-white/60 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-white/60 text-xs mt-1">
                  {question.length}/200 characters
                </div>
              </div>

              {/* Card Back */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Answer/Back Side
                </Label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full p-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-white/20 focus:border-white/60 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-white/60 text-xs mt-1">
                  {answer.length}/200 characters
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
                  onClick={() => handleCreateFlashcard(false)}
                  disabled={!question.trim() || !answer.trim() || createFlashcardMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold touch-btn"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Card
                </Button>
                <Button
                  onClick={() => handleCreateFlashcard(true)}
                  disabled={!question.trim() || !answer.trim() || createFlashcardMutation.isPending}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white py-3 px-4 rounded-xl font-semibold touch-btn"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create & Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
