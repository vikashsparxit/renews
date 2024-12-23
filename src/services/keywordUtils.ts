import { useKeywordStore } from './keywordService';

export const containsKeyword = (text: string, keywords: Array<{ text: string, active: boolean }>) => {
  const activeKeywords = keywords.filter(k => k.active);
  console.log('Active keywords:', activeKeywords.map(k => k.text));
  
  if (activeKeywords.length === 0) {
    console.log('No active keywords, allowing all articles');
    return true;
  }
  
  const lowerText = text.toLowerCase();
  console.log('Checking text:', lowerText);
  
  for (const keyword of activeKeywords) {
    const isMatch = lowerText.includes(keyword.text.toLowerCase());
    console.log(`Keyword "${keyword.text}": ${isMatch ? 'matched' : 'no match'}`);
    if (isMatch) return true;
  }
  
  return false;
};

export const checkArticleKeywords = (title: string, content: string) => {
  const keywords = useKeywordStore.getState().keywords;
  console.log(`Checking keywords for article: "${title}"`);
  
  const titleMatch = containsKeyword(title, keywords);
  const contentMatch = containsKeyword(content, keywords);
  
  console.log(`Title match: ${titleMatch}, Content match: ${contentMatch}`);
  return titleMatch || contentMatch;
};