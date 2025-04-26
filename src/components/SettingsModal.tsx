import React, { useState } from 'react';
import { FeedSource } from '../types';
import { toggleCorsProxy, isCorsProxyEnabled } from '../services/corsProxyService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedSources: FeedSource[];
  onAddFeed: (url: string) => void;
  onRemoveFeed: (id: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  feedSources,
  onAddFeed,
  onRemoveFeed
}) => {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState<boolean>(isCorsProxyEnabled());

  const handleAddFeed = () => {
    // URLの簡易バリデーション
    if (!newFeedUrl.trim()) {
      setError('URLを入力してください');
      return;
    }

    try {
      new URL(newFeedUrl); // URLが有効かチェック
      onAddFeed(newFeedUrl);
      setNewFeedUrl('');
      setError(null);
    } catch (e) {
      setError('有効なURLを入力してください');
    }
  };

  const handleProxyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setUseProxy(newValue);
    toggleCorsProxy(newValue);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>RSSフィード設定</h2>
        
        <div className="feed-sources-list">
          {feedSources.length === 0 ? (
            <p>登録されているRSSフィードはありません</p>
          ) : (
            <ul>
              {feedSources.map(source => (
                <li key={source.id} className="feed-source-item">
                  <span className="feed-source-url">{source.url}</span>
                  <span className="feed-source-title">{source.title || '未取得'}</span>
                  <button 
                    onClick={() => onRemoveFeed(source.id)}
                    className="remove-feed-btn"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="add-feed-form">
          <input
            type="text"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="RSSフィードのURLを入力"
            className="feed-url-input"
          />
          <button 
            onClick={handleAddFeed}
            className="add-feed-btn"
          >
            追加
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="proxy-setting">
          <label className="proxy-label">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={handleProxyToggle}
              className="proxy-checkbox"
            />
            CORSプロキシを使用する（外部サイトのRSSを取得する場合に必要）
          </label>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">閉じる</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
