import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, ChevronRight, FolderOpen } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, Folder, Flashcard } from "@shared/schema";

const FOLDER_COLORS = [
  { name: "Yellow", value: "yellow" },
  { name: "Pink", value: "pink" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "White", value: "white" },
];

export default function Folders() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("yellow");
  
  // Extract categoryId from URL
  const categoryId = parseInt(window.location.pathname.split('/')[2]);
  
  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", categoryId],
    queryFn: async () => {
      const categories = await apiGet("/api/categories");
      return categories.find((cat: Category) => cat.id === categoryId);
    }
  });

  const { data: folders = [], isLoading } = useQuery<Folder[]>({
    queryKey: ["/api/folders", categoryId],
    queryFn: () => apiGet(`/api/folders/category/${categoryId}`)
  });

  const { data: allFlashcards = [] } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards"],
    queryFn: async () => {
      const allCards = [];
      for (const folder of folders) {
        const folderCards = await apiGet(`/api/flashcards/folder/${folder.id}`);
        allCards.push(...folderCards);
      }
      return allCards;
    },
    enabled: folders.length > 0
  });

  const createFolderMutation = useMutation({
    mutationFn: (data: { name: string; categoryId: number; color: string }) => 
      apiPost("/api/folders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders", categoryId] });
      setShowCreateDialog(false);
      setFolderName("");
      setFolderColor("yellow");
      toast({
        title: "Success",
        description: "Folder created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    
    createFolderMutation.mutate({
      name: folderName.trim(),
      categoryId,
      color: folderColor
    });
  };

  const getFolderCardCount = (folderId: number) => {
    return allFlashcards.filter(card => card.folderId === folderId).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animate-fade-in">
        <NavigationHeader 
          title="Loading..." 
          showBack 
          backTo="/categories" 
        />
        <div className="px-4 pt-8">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
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
        title={category?.name || "Folders"} 
        subtitle="Folders in this category"
        showBack 
        backTo="/categories" 
      />
      
      <main className="px-4 pb-8">
        {/* Create Folder Button */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl font-semibold touch-btn mb-6 border-2 border-white/30 border-dashed hover:bg-white/30 transition-all duration-300"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Folder
        </Button>

        {/* Folders Grid */}
        {folders.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No Folders Yet</h3>
              <p className="text-white/70 mb-4">
                Create your first folder to organize your flashcards
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Folder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {folders.map((folder) => {
              const cardCount = getFolderCardCount(folder.id);
              return (
                <Card
                  key={folder.id}
                  className={`p-4 cursor-pointer card-shadow transition-all duration-200 hover:scale-105 ${
                    folder.color === "yellow" ? "folder-yellow" :
                    folder.color === "pink" ? "folder-pink" :
                    folder.color === "blue" ? "folder-blue" :
                    folder.color === "green" ? "folder-green" :
                    "folder-white"
                  }`}
                  onClick={() => navigate(`/flashcards/${folder.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium opacity-70">
                      {category?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 opacity-60 hover:opacity-100"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">{folder.name}</h4>
                  <p className="text-xs opacity-70 mb-3">{cardCount} cards</p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/create-flashcard/${folder.id}`);
                    }}
                    className="w-full bg-black/10 hover:bg-black/20 text-current py-2 px-3 rounded-lg text-xs font-medium transition-colors h-auto"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Cards
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Folder Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 text-gray-900">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Folder Color</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {FOLDER_COLORS.map((color) => (
                    <Button
                      key={color.value}
                      variant={folderColor === color.value ? "default" : "outline"}
                      className={`h-12 ${
                        color.value === "yellow" ? "bg-yellow-200 border-yellow-300 text-yellow-800" :
                        color.value === "pink" ? "bg-pink-200 border-pink-300 text-pink-800" :
                        color.value === "blue" ? "bg-blue-200 border-blue-300 text-blue-800" :
                        color.value === "green" ? "bg-green-200 border-green-300 text-green-800" :
                        "bg-white border-gray-300 text-gray-800"
                      } ${folderColor === color.value ? "" : "opacity-70"}`}
                      onClick={() => setFolderColor(color.value)}
                    >
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim() || createFolderMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
