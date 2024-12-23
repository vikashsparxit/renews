import { useQuery } from "@tanstack/react-query";
import { fetchFeeds, fetchArticles } from "@/services/rssService";
import { useState } from "react";

export const useRSSFeeds = () => {
  const [lastProcessedTime, setLastProcessedTime] = useState<Date | null>(null);
  
  const { 
    data: feeds,
    isLoading: isFeedsLoading,
  } = useQuery({
    queryKey: ['feeds'],
    queryFn: fetchFeeds,
  });

  const {
    data: articles,
    isLoading: isArticlesLoading,
    isRefetching: isArticlesRefetching,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const articles = await fetchArticles();
      setLastProcessedTime(new Date());
      return articles;
    },
  });

  const refresh = () => {
    refetchArticles();
  };

  return {
    feeds,
    articles,
    isLoading: isFeedsLoading || isArticlesLoading,
    isRefreshing: isArticlesRefetching,
    refresh,
    lastProcessedTime,
  };
};