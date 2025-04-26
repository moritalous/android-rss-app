import React, { useRef, useEffect } from 'react';
import { FeedItem as FeedItemType } from '../types';
import DOMPurify from 'dompurify';

interface FeedItemProps {
  item: FeedItemType;
  onRead: (id: string) => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ item, onRead }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection Observerを使用して、アイテムが画面に表示されたかどうかを検出
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // アイテムが画面から出たときに既読にする
          if (!entry.isIntersecting && !item.isRead) {
            onRead(item.id);
          }
        });
      },
      { threshold: 0.1 } // 10%以上表示されたら検出
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, [item.id, item.isRead, onRead]);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP');
    } catch (e) {
      return dateString;
    }
  };

  // HTMLをサニタイズ
  const createMarkup = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div 
      ref={itemRef}
      className={`feed-item ${item.isRead ? 'read' : 'unread'}`}
    >
      <h2 className="feed-title">
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h2>
      <div className="feed-meta">
        <span className="feed-source">{item.source}</span>
        <span className="feed-date">{formatDate(item.pubDate)}</span>
        <span className={`feed-status ${item.isRead ? 'read' : 'unread'}`}>
          {item.isRead ? '既読' : '未読'}
        </span>
      </div>
      <div 
        className="feed-description"
        dangerouslySetInnerHTML={createMarkup(item.description)}
      />
    </div>
  );
};

export default FeedItem;
