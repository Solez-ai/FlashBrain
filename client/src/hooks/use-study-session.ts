import { useState, useEffect, useCallback } from "react";
import type { Flashcard } from "@shared/schema";

export function useStudySession(flashcards: Flashcard[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [completedCards, setCompletedCards] = useState(0);
  const [cardsViewed, setCardsViewed] = useState(new Set<number>());

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || !autoPlayInterval || flashcards.length === 0) return;

    const timer = setInterval(() => {
      if (isFlipped) {
        // If card is flipped, move to next card
        nextCard();
      } else {
        // If card is not flipped, flip it
        setIsFlipped(true);
      }
    }, autoPlayInterval * 1000);

    return () => clearInterval(timer);
  }, [isAutoPlay, autoPlayInterval, isFlipped, currentIndex, flashcards.length]);

  const nextCard = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      // Mark current card as viewed if both sides were seen (card was flipped)
      if (isFlipped && !cardsViewed.has(currentIndex)) {
        setCardsViewed(prev => {
          const newSet = new Set(prev);
          newSet.add(currentIndex);
          return newSet;
        });
        setCompletedCards(prev => prev + 1);
      }
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length, isFlipped, cardsViewed]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const setAutoPlay = useCallback((interval: number) => {
    setAutoPlayInterval(interval);
    setIsAutoPlay(true);
  }, []);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlay(false);
    setAutoPlayInterval(null);
  }, []);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAutoPlay(false);
    setAutoPlayInterval(null);
    setCompletedCards(0);
    setCardsViewed(new Set());
  }, []);

  const getSessionStats = useCallback(() => {
    const currentTime = Date.now();
    const duration = Math.floor((currentTime - startTime) / 1000); // in seconds
    const totalCards = flashcards.length;
    
    // Count the current card if it was flipped when session ends
    let finalCompletedCards = completedCards;
    if (isFlipped && !cardsViewed.has(currentIndex)) {
      finalCompletedCards += 1;
    }
    
    const accuracy = totalCards > 0 ? Math.round((finalCompletedCards / totalCards) * 100) : 0;
    
    return {
      duration,
      totalCards,
      completedCards: finalCompletedCards,
      accuracy,
      durationMinutes: Math.floor(duration / 60),
      durationSeconds: duration % 60
    };
  }, [startTime, flashcards.length, completedCards, isFlipped, currentIndex, cardsViewed]);

  return {
    currentIndex,
    isFlipped,
    isAutoPlay,
    autoPlayInterval,
    startTime,
    completedCards,
    nextCard,
    previousCard,
    flipCard,
    setAutoPlay,
    pauseAutoPlay,
    resetSession,
    getSessionStats
  };
}
