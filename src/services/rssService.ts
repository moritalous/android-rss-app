import { XMLParser } from 'fast-xml-parser';
import { FeedItem, FeedSource } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { fetchWithCorsProxy } from './corsProxyService';

// ローカルストレージのキー
const FEED_SOURCES_KEY = 'rss_feed_sources';
const READ_ITEMS_KEY = 'rss_read_items';

// XMLパーサーの設定
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item', 'entry'].includes(name)
});

// RSSフィードを直接取得する関数
export const fetchRssFeed = async (url: string): Promise<{items: FeedItem[], feedTitle: string}> => {
  try {
    // CORSプロキシを使用してRSSフィードを取得
    const xmlData = await fetchWithCorsProxy(url);

    // XMLをパース
    const result = parser.parse(xmlData);
    
    // 既読アイテムのIDを取得
    const readItemIds = getReadItemIds();
    
    let feedTitle = '';
    let items: FeedItem[] = [];

    // RSS 2.0形式の場合
    if (result.rss && result.rss.channel) {
      feedTitle = result.rss.channel.title || 'Unknown Feed';
      items = (result.rss.channel.item || []).map((item: any) => {
        const itemId = item.guid?.['#text'] || item.guid || item.link || uuidv4();
        return {
          id: uuidv4(),
          title: item.title || 'No Title',
          link: item.link || '',
          description: item.description || '',
          pubDate: item.pubDate || new Date().toISOString(),
          isRead: readItemIds.includes(itemId),
          source: feedTitle
        };
      });
    }
    // Atom形式の場合
    else if (result.feed) {
      feedTitle = result.feed.title || 'Unknown Feed';
      items = (result.feed.entry || []).map((entry: any) => {
        const itemId = entry.id || entry.link?.['@_href'] || uuidv4();
        return {
          id: uuidv4(),
          title: entry.title || 'No Title',
          link: entry.link?.['@_href'] || '',
          description: entry.content || entry.summary || '',
          pubDate: entry.updated || entry.published || new Date().toISOString(),
          isRead: readItemIds.includes(itemId),
          source: feedTitle
        };
      });
    }
    // その他の形式の場合
    else {
      throw new Error('サポートされていないフィード形式です');
    }

    return {
      items,
      feedTitle
    };
  } catch (error) {
    console.error('RSSフィードの取得エラー:', error);
    throw new Error('フィードの取得に失敗しました');
  }
};

// 複数のRSSフィードを取得する関数
export const fetchAllFeeds = async (sources: FeedSource[]): Promise<FeedItem[]> => {
  try {
    const feedPromises = sources.map(source => fetchRssFeed(source.url));
    const results = await Promise.allSettled(feedPromises);
    
    let allItems: FeedItem[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems = [...allItems, ...result.value.items];
        
        // フィードのタイトルを更新
        if (result.value.feedTitle && !sources[index].title) {
          updateFeedSourceTitle(sources[index].id, result.value.feedTitle);
        }
      } else {
        console.error(`フィード ${sources[index].url} の取得に失敗:`, result.reason);
      }
    });
    
    return allItems;
  } catch (error) {
    console.error('複数フィードの取得エラー:', error);
    throw new Error('フィードの取得に失敗しました');
  }
};

// フィードソースをローカルストレージから取得
export const getFeedSources = (): FeedSource[] => {
  const sourcesJson = localStorage.getItem(FEED_SOURCES_KEY);
  return sourcesJson ? JSON.parse(sourcesJson) : [];
};

// フィードソースをローカルストレージに保存
export const saveFeedSources = (sources: FeedSource[]): void => {
  localStorage.setItem(FEED_SOURCES_KEY, JSON.stringify(sources));
};

// 新しいフィードソースを追加
export const addFeedSource = (url: string): FeedSource => {
  const sources = getFeedSources();
  
  // 既に同じURLが登録されていないかチェック
  if (sources.some(source => source.url === url)) {
    throw new Error('このURLは既に登録されています');
  }
  
  const newSource: FeedSource = {
    id: uuidv4(),
    url,
  };
  
  saveFeedSources([...sources, newSource]);
  return newSource;
};

// フィードソースを削除
export const removeFeedSource = (id: string): void => {
  const sources = getFeedSources();
  const updatedSources = sources.filter(source => source.id !== id);
  saveFeedSources(updatedSources);
};

// フィードソースのタイトルを更新
export const updateFeedSourceTitle = (id: string, title: string): void => {
  const sources = getFeedSources();
  const updatedSources = sources.map(source => 
    source.id === id ? { ...source, title } : source
  );
  saveFeedSources(updatedSources);
};

// 既読アイテムのIDをローカルストレージから取得
export const getReadItemIds = (): string[] => {
  const readItemsJson = localStorage.getItem(READ_ITEMS_KEY);
  return readItemsJson ? JSON.parse(readItemsJson) : [];
};

// アイテムを既読としてマーク
export const markItemAsRead = (itemId: string): void => {
  const readItemIds = getReadItemIds();
  if (!readItemIds.includes(itemId)) {
    localStorage.setItem(READ_ITEMS_KEY, JSON.stringify([...readItemIds, itemId]));
  }
};

// すべてのアイテムを既読としてマーク
export const markAllAsRead = (items: FeedItem[]): void => {
  const readItemIds = getReadItemIds();
  const newReadIds = items
    .filter(item => !item.isRead)
    .map(item => item.id);
  
  localStorage.setItem(READ_ITEMS_KEY, JSON.stringify([...readItemIds, ...newReadIds]));
};
