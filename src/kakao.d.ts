interface KakaoShareArgs {
  templateId: number;
  templateArgs?: Record<string, string>;
}

interface KakaoShare {
  sendCustom: (args: KakaoShareArgs) => void;
}

interface KakaoSDK {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: KakaoShare;
}

interface Window {
  Kakao: KakaoSDK;
}
