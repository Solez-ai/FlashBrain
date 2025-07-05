import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@shared/schema";

interface FlashcardProps {
  flashcard: Flashcard;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export default function FlashcardComponent({ 
  flashcard, 
  isFlipped = false, 
  onFlip,
  className 
}: FlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  
  const flipped = onFlip ? isFlipped : internalFlipped;
  
  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const getCardStyle = (style: string) => {
    switch (style) {
      case "yellow":
        return "folder-yellow";
      case "pink":
        return "folder-pink";
      case "blue":
        return "folder-blue";
      case "green":
        return "folder-green";
      default:
        return "folder-white";
    }
  };

  const getTextSize = (text: string) => {
    const length = text.length;
    if (length < 20) return "text-lg";
    if (length < 40) return "text-base";
    return "text-sm";
  };

  return (
    <div className={cn("flashcard-flip cursor-pointer", className)} onClick={handleFlip}>
      <div className={cn("flashcard-inner", flipped && "transform rotate-y-180")}>
        <Card className={cn(
          "flashcard-front card-shadow",
          getCardStyle(flashcard.cardStyle)
        )}>
          <div className="p-6 h-full flex items-center justify-center">
            <p className={cn(
              "font-medium text-center",
              getTextSize(flashcard.question)
            )}>
              {flashcard.question}
            </p>
          </div>
        </Card>
        <Card className={cn(
          "flashcard-back card-shadow",
          getCardStyle(flashcard.cardStyle)
        )}>
          <div className="p-6 h-full flex items-center justify-center">
            <p className={cn(
              "font-medium text-center",
              getTextSize(flashcard.answer)
            )}>
              {flashcard.answer}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
