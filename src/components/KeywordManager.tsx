import { useState } from 'react';
import { useKeywordStore } from '@/services/keywordService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const KeywordManager = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const { keywords, addKeyword, removeKeyword, toggleKeyword } = useKeywordStore();

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim());
      setNewKeyword('');
      toast.success('Keyword added successfully');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add new keyword..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
        />
        <Button onClick={handleAddKeyword} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <Badge
            key={keyword.id}
            variant={keyword.active ? 'default' : 'secondary'}
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => toggleKeyword(keyword.id)}
          >
            {keyword.text}
            <X
              className="h-3 w-3 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeKeyword(keyword.id);
                toast.success('Keyword removed');
              }}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};