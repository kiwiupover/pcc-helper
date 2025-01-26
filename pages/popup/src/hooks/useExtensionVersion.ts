import { useEffect, useState } from 'react';

export const useExtensionVersion = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const manifest = chrome.runtime.getManifest();
    setVersion(manifest.version);
  }, []);

  return version;
};
