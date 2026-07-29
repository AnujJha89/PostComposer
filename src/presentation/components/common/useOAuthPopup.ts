import { useEffect, useCallback } from 'react';

export function useOAuthPopup(
  url: string,
  onSuccess: () => void,
  title = 'Connect Account'
) {
  const openPopup = useCallback(() => {
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = (event: MessageEvent) => {
      
      if (event.data === 'oauth_success') {
        onSuccess();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  }, [url, title, onSuccess]);

  return { openPopup };
}
