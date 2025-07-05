import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bot, Loader2, Info, Sparkles } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, Folder } from "@shared/schema";

export default function CreateAI() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [maxCards, setMaxCards] = useState("20");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: () => apiGet("/api/categories")
  });

  const { data: allFolders = [] } = useQuery<Folder[]>({
    queryKey: ["/api/folders", "all", categories.map(c => c.id)],
    queryFn: async () => {
      const allFolders = [];
      for (const category of categories) {
        const categoryFolders = await apiGet(`/api/folders/category/${category.id}`);
        allFolders.push(...categoryFolders);
      }
      return allFolders;
    },
    enabled: categories.length > 0
  });

  const generateFlashcardsMutation = useMutation({
    mutationFn: async (data: { text: string; folderId: number; maxCards: number }) => {
      setIsGenerating(true);
      const response = await apiPost("/api/flashcards/generate", data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      toast({
        title: "Success!",
        description: `${data.message}`,
      });
      
      // Navigate to the folder where cards were created
      if (selectedFolderId) {
        navigate(`/flashcards/${selectedFolderId}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerateFlashcards = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFolderId) {
      toast({
        title: "Error",
        description: "Please select a folder to save the flashcards.",
        variant: "destructive",
      });
      return;
    }
    
    generateFlashcardsMutation.mutate({
      text: text.trim(),
      folderId: parseInt(selectedFolderId),
      maxCards: parseInt(maxCards)
    });
  };

  const getFolderDisplayName = (folder: Folder) => {
    const category = categories.find(cat => cat.id === folder.categoryId);
    return `${category?.name} > ${folder.name}`;
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <NavigationHeader 
        title="AI Flashcard Generator" 
        showBack 
        backTo="/"
      />
      
      <main className="px-4 pb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Folder Selection */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Select Folder</Label>
                {allFolders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/70 mb-4">
                      No folders available. Create a category and folder first.
                    </p>
                    <Button
                      onClick={() => navigate("/categories")}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      Create Categories & Folders
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger className="w-full p-4 bg-white/20 backdrop-blur-sm text-white border-white/20 focus:border-white/60">
                      <SelectValue placeholder="Choose a folder..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                      {allFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id.toString()}>
                          {getFolderDisplayName(folder)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Text Input */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Paste Your Study Material
                </Label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here and AI will generate smart flashcards..."
                  className="w-full p-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-white/20 focus:border-white/60 resize-none"
                  rows={8}
                />
                <div className="flex items-center text-white/60 text-xs mt-1">
                  <Info className="mr-1 h-3 w-3" />
                  AI will create concise flashcards with max 10 words per side
                </div>
              </div>

              {/* AI Settings */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Max cards to generate</span>
                      <Select value={maxCards} onValueChange={setMaxCards}>
                        <SelectTrigger className="w-32 bg-white/20 text-white border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                          <SelectItem value="10">10 cards</SelectItem>
                          <SelectItem value="20">20 cards</SelectItem>
                          <SelectItem value="30">30 cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateFlashcards}
                disabled={!text.trim() || !selectedFolderId || isGenerating || allFolders.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold touch-btn transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-5 w-5" />
                    Generate Flashcards with AI
                  </>
                )}
              </Button>

              {/* AI Status */}
              {isGenerating && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
                    <p className="text-white text-sm">AI is analyzing your text...</p>
                    <p className="text-white/70 text-xs mt-1">This may take a few moments</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
