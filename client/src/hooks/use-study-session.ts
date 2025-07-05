import { useState, useEffect, useCallback } from "react";
import type { Flashcard } from "@shared/schema";

export function useStudySession(flashcards: Flashcard[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

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
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length]);

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
  }, []);

  return {
    currentIndex,
    isFlipped,
    isAutoPlay,
    autoPlayInterval,
    startTime,
    nextCard,
    previousCard,
    flipCard,
    setAutoPlay,
    pauseAutoPlay,
    resetSession
  };
}
