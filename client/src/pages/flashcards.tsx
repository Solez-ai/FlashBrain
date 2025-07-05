import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play, Plus, Edit, Trash2, Clock } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { apiGet } from "@/lib/api";
import type { Folder, Flashcard } from "@shared/schema";

export default function Flashcards() {
  const [, navigate] = useLocation();
  
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

  const { data: flashcards = [], isLoading } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", folderId],
    queryFn: () => apiGet(`/api/flashcards/folder/${folderId}`)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen animate-fade-in">
        <NavigationHeader 
          title="Loading..." 
          showBack 
          backTo="/categories" 
        />
        <div className="px-4 pt-8">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <NavigationHeader 
        title={folder?.name || "Flashcards"} 
        subtitle={`${flashcards.length} flashcards`}
        showBack 
        backTo={`/folders/${folder?.categoryId}`}
      />
      
      <main className="px-4 pb-8">
        {/* Study Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Study Options</h3>
              <Button
                onClick={() => navigate(`/study/${folderId}`)}
                disabled={flashcards.length === 0}
                className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium text-sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Study
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-white text-lg font-bold">Manual</div>
                  <div className="text-white/70 text-xs">Use arrow buttons</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-white text-lg font-bold">Auto</div>
                  <div className="text-white/70 text-xs">Timed intervals</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Flashcards List */}
        {flashcards.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white/50" />
              </div>
              <h3 className="text-white font-semibold mb-2">No Flashcards Yet</h3>
              <p className="text-white/70 mb-4">
                Create your first flashcard to start studying
              </p>
              <Button
                onClick={() => navigate(`/create-flashcard/${folderId}`)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Flashcard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {flashcards.map((flashcard) => (
              <Card
                key={flashcard.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm mb-1">
                        {flashcard.question}
                      </p>
                      <p className="text-white/70 text-xs line-clamp-2">
                        {flashcard.answer}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <div className="fixed bottom-8 right-4 z-20">
          <Button
            onClick={() => navigate(`/create-flashcard/${folderId}`)}
            className="w-14 h-14 bg-primary hover:bg-primary/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </div>
      </main>
    </div>
  );
}
