// RSSフィードのアイテムを表す型
export interface FeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  isRead: boolean;
  source: string;
}

// RSSフィードのソース情報を表す型
export interface FeedSource {
  id: string;
  url: string;
  title?: string;
}

// ソート順の型
export type SortOrder = 'new-to-old' | 'old-to-new';

// フィルターの型
export type FilterType = 'all' | 'unread';
