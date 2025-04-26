import React from 'react';
import { SortOrder, FilterType } from '../types';

interface HeaderProps {
  sortOrder: SortOrder;
  filterType: FilterType;
  onSortChange: (sortOrder: SortOrder) => void;
  onFilterChange: (filterType: FilterType) => void;
  onSettingsClick: () => void;
  onRefreshClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  sortOrder,
  filterType,
  onSortChange,
  onFilterChange,
  onSettingsClick,
  onRefreshClick
}) => {
  return (
    <header className="app-header">
      <h1>RSSリーダー</h1>
      <div className="controls">
        <select 
          value={sortOrder} 
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="sort-select"
        >
          <option value="new-to-old">新しい順</option>
          <option value="old-to-new">古い順</option>
        </select>
        
        <select 
          value={filterType} 
          onChange={(e) => onFilterChange(e.target.value as FilterType)}
          className="filter-select"
        >
          <option value="all">すべて</option>
          <option value="unread">未読のみ</option>
        </select>
        
        <button onClick={onSettingsClick} className="settings-button">
          設定
        </button>
        
        <button onClick={onRefreshClick} className="refresh-button">
          更新
        </button>
      </div>
    </header>
  );
};

export default Header;
