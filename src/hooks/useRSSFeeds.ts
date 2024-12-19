import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFeeds, fetchArticles, refreshFeeds, type Article, type RSSFeed } from "@/services/rssService";

export const useRSSFeeds = () => {
  const queryClient = useQueryClient();

  const feedsQuery = useQuery({
    queryKey: ["feeds"],
    queryFn: fetchFeeds,
  });

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  const refreshMutation = useMutation({
    mutationFn: refreshFeeds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });

  return {
    feeds: feedsQuery.data as RSSFeed[],
    articles: articlesQuery.data as Article[],
    isLoading: feedsQuery.isLoading || articlesQuery.isLoading,
    isRefreshing: refreshMutation.isPending,
    refresh: refreshMutation.mutate,
  };
};