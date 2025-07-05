import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Settings } from "lucide-react";
import { useLocation } from "wouter";

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  showSettings?: boolean;
  onSettings?: () => void;
}

export default function NavigationHeader({
  title,
  subtitle,
  showBack = false,
  backTo,
  onBack,
  showSettings = false,
  onSettings
}: NavigationHeaderProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    }
  };

  return (
    <header className="px-4 py-6 pt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showBack ? (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="touch-btn w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="ml-2">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-white/70 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showSettings && (
            <Button
              onClick={onSettings}
              variant="ghost"
              size="icon"
              className="touch-btn w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
