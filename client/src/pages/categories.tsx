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
import type { Category, Folder } from "@shared/schema";

const CATEGORY_COLORS = [
  { name: "Purple", value: "hsl(263, 85%, 68%)" },
  { name: "Blue", value: "hsl(215, 93%, 68%)" },
  { name: "Green", value: "hsl(142, 93%, 68%)" },
  { name: "Yellow", value: "hsl(45, 93%, 68%)" },
  { name: "Pink", value: "hsl(330, 93%, 68%)" },
  { name: "Orange", value: "hsl(25, 93%, 68%)" },
];

export default function Categories() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(CATEGORY_COLORS[0].value);
  
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: () => apiGet("/api/categories")
  });

  const { data: allFolders = [] } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
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

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => 
      apiPost("/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowCreateDialog(false);
      setCategoryName("");
      setCategoryColor(CATEGORY_COLORS[0].value);
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateCategory = () => {
    if (!categoryName.trim()) return;
    
    createCategoryMutation.mutate({
      name: categoryName.trim(),
      color: categoryColor
    });
  };

  const getCategoryFolders = (categoryId: number) => {
    return allFolders.filter(folder => folder.categoryId === categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animate-fade-in">
        <NavigationHeader title="Categories" showBack backTo="/" />
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
      <NavigationHeader title="Categories" showBack backTo="/" />
      
      <main className="px-4 pb-8">
        {/* Create Category Button */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl font-semibold touch-btn mb-6 border-2 border-white/30 border-dashed hover:bg-white/30 transition-all duration-300"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Category
        </Button>

        {/* Categories List */}
        {categories.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No Categories Yet</h3>
              <p className="text-white/70 mb-4">
                Create your first category to organize your flashcards
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const folders = getCategoryFolders(category.id);
              return (
                <Card
                  key={category.id}
                  className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/folders/${category.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="text-white font-semibold">{category.name}</h3>
                          <p className="text-white/70 text-sm">
                            {folders.length} folders
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Category Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 text-gray-900">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category Color</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CATEGORY_COLORS.map((color) => (
                    <Button
                      key={color.value}
                      variant={categoryColor === color.value ? "default" : "outline"}
                      className="h-12"
                      style={{ 
                        backgroundColor: categoryColor === color.value ? color.value : 'transparent',
                        borderColor: color.value,
                        color: categoryColor === color.value ? 'white' : color.value
                      }}
                      onClick={() => setCategoryColor(color.value)}
                    >
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateCategory}
                  disabled={!categoryName.trim() || createCategoryMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
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
