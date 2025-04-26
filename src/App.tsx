import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import FeedList from './components/FeedList';
import SettingsModal from './components/SettingsModal';
import { FeedItem, FeedSource, SortOrder, FilterType } from './types';
import {
  fetchAllFeeds,
  getFeedSources,
  addFeedSource,
  removeFeedSource,
  markItemAsRead
} from './services/rssService';

function App() {
  // 状態管理
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedSources, setFeedSources] = useState<FeedSource[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('new-to-old');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期化時にフィードソースを読み込む
  useEffect(() => {
    const sources = getFeedSources();
    setFeedSources(sources);
    
    if (sources.length > 0) {
      loadFeeds(sources);
    }
  }, []);

  // フィードを読み込む
  const loadFeeds = async (sources: FeedSource[]) => {
    if (sources.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await fetchAllFeeds(sources);
      setFeedItems(items);
      // フィードソースの最新情報を取得
      setFeedSources(getFeedSources());
    } catch (err) {
      setError('フィードの読み込み中にエラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // フィードを更新
  const handleRefresh = () => {
    loadFeeds(feedSources);
  };

  // ソート順変更
  const handleSortChange = (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder);
  };

  // フィルター変更
  const handleFilterChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
  };

  // 設定モーダルを開く
  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  // 設定モーダルを閉じる
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // フィードを追加
  const handleAddFeed = (url: string) => {
    try {
      const newSource = addFeedSource(url);
      const updatedSources = [...feedSources, newSource];
      setFeedSources(updatedSources);
      loadFeeds(updatedSources);
    } catch (err) {
      setError('フィードの追加に失敗しました');
      console.error(err);
    }
  };

  // フィードを削除
  const handleRemoveFeed = (id: string) => {
    try {
      removeFeedSource(id);
      const updatedSources = feedSources.filter(source => source.id !== id);
      setFeedSources(updatedSources);
      
      // 削除されたソースからのアイテムを除外
      const sourceToRemove = feedSources.find(source => source.id === id);
      if (sourceToRemove) {
        const updatedItems = feedItems.filter(item => item.source !== sourceToRemove.title);
        setFeedItems(updatedItems);
      }
    } catch (err) {
      setError('フィードの削除に失敗しました');
      console.error(err);
    }
  };

  // アイテムを既読にする
  const handleMarkAsRead = (id: string) => {
    markItemAsRead(id);
    setFeedItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  return (
    <div className="app-container">
      <Header
        sortOrder={sortOrder}
        filterType={filterType}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onSettingsClick={handleSettingsClick}
        onRefreshClick={handleRefresh}
      />
      
      <main className="main-content">
        <FeedList
          items={feedItems}
          sortOrder={sortOrder}
          filterType={filterType}
          onMarkAsRead={handleMarkAsRead}
          isLoading={isLoading}
          error={error}
        />
      </main>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        feedSources={feedSources}
        onAddFeed={handleAddFeed}
        onRemoveFeed={handleRemoveFeed}
      />
    </div>
  );
}

export default App;
