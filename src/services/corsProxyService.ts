import axios from 'axios';

// CORSプロキシのオプション
const PROXY_OPTIONS = {
  // プロキシを使用するかどうか
  useProxy: true, // GitHub Pagesではデフォルトでプロキシを有効に
  // 複数のCORSプロキシを用意しておく（一つが使えなくなった場合の代替として）
  PROXIES: [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
  ],
  // 現在使用中のプロキシのインデックス
  currentProxyIndex: 0
};

/**
 * CORSプロキシの使用状態を切り替える
 * @param useProxy プロキシを使用するかどうか
 */
export const toggleCorsProxy = (useProxy: boolean): void => {
  PROXY_OPTIONS.useProxy = useProxy;
  // ローカルストレージに設定を保存
  try {
    localStorage.setItem('cors_proxy_enabled', useProxy ? 'true' : 'false');
  } catch (e) {
    console.error('ローカルストレージへの保存に失敗:', e);
  }
  console.log(`CORSプロキシ: ${useProxy ? 'オン' : 'オフ'}`);
};

/**
 * CORSプロキシの現在の状態を取得する
 * @returns プロキシを使用しているかどうか
 */
export const isCorsProxyEnabled = (): boolean => {
  // ローカルストレージから設定を読み込み
  try {
    const savedSetting = localStorage.getItem('cors_proxy_enabled');
    if (savedSetting !== null) {
      return savedSetting === 'true';
    }
  } catch (e) {
    console.error('ローカルストレージからの読み込みに失敗:', e);
  }
  return PROXY_OPTIONS.useProxy;
};

/**
 * URLからデータを取得する（プロキシの使用有無に応じて）
 * @param url 取得するURL
 * @returns レスポンスデータ
 */
export const fetchWithCorsProxy = async (url: string): Promise<string> => {
  // プロキシを使用しない場合は直接取得を試みる
  if (!isCorsProxyEnabled()) {
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/xml',
        },
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.error('直接フェッチに失敗:', error);
      throw new Error('直接フェッチに失敗しました。CORSプロキシを有効にすることを検討してください。');
    }
  }

  // プロキシを使用する場合
  // 最初のプロキシを試す
  try {
    return await tryFetchWithProxy(url, PROXY_OPTIONS.currentProxyIndex);
  } catch (error) {
    console.error(`プロキシ ${PROXY_OPTIONS.PROXIES[PROXY_OPTIONS.currentProxyIndex]} でのフェッチに失敗:`, error);
    
    // 他のプロキシを順番に試す
    for (let i = 0; i < PROXY_OPTIONS.PROXIES.length; i++) {
      if (i === PROXY_OPTIONS.currentProxyIndex) continue;
      
      try {
        const result = await tryFetchWithProxy(url, i);
        // 成功したプロキシを記憶
        PROXY_OPTIONS.currentProxyIndex = i;
        return result;
      } catch (innerError) {
        console.error(`プロキシ ${PROXY_OPTIONS.PROXIES[i]} でのフェッチに失敗:`, innerError);
      }
    }
    
    // すべてのプロキシが失敗した場合
    throw new Error('すべてのCORSプロキシでの取得に失敗しました');
  }
};

/**
 * 指定されたプロキシを使用してURLからデータを取得する
 * @param url 取得するURL
 * @param proxyIndex 使用するプロキシのインデックス
 * @returns レスポンスデータ
 */
const tryFetchWithProxy = async (url: string, proxyIndex: number): Promise<string> => {
  const proxyUrl = PROXY_OPTIONS.PROXIES[proxyIndex] + url;
  
  const response = await axios.get(proxyUrl, {
    headers: {
      'Content-Type': 'application/xml',
      'X-Requested-With': 'XMLHttpRequest'
    },
    responseType: 'text'
  });
  
  return response.data;
};
