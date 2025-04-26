import React from 'react';
import FeedItem from './FeedItem';
import { FeedItem as FeedItemType, SortOrder, FilterType } from '../types';

interface FeedListProps {
  items: FeedItemType[];
  sortOrder: SortOrder;
  filterType: FilterType;
  onMarkAsRead: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

const FeedList: React.FC<FeedListProps> = ({
  items,
  sortOrder,
  filterType,
  onMarkAsRead,
  isLoading,
  error
}) => {
  // フィルタリングとソートを適用
  const getFilteredAndSortedItems = () => {
    // フィルタリング
    let filteredItems = items;
    if (filterType === 'unread') {
      filteredItems = items.filter(item => !item.isRead);
    }

    // ソート
    return [...filteredItems].sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      
      return sortOrder === 'new-to-old' 
        ? dateB - dateA  // 新しい順
        : dateA - dateB; // 古い順
    });
  };

  const filteredAndSortedItems = getFilteredAndSortedItems();

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (filteredAndSortedItems.length === 0) {
    return <div className="empty-state">表示するフィードがありません</div>;
  }

  return (
    <div className="feed-list">
      {filteredAndSortedItems.map(item => (
        <FeedItem 
          key={item.id} 
          item={item} 
          onRead={onMarkAsRead} 
        />
      ))}
    </div>
  );
};

export default FeedList;
