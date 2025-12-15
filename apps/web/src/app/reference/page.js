import ScalarAPI from '@/components/common/ScalarAPI';
import { getApiHost } from '@/lib/api-url';

export default function ApiReference() {
  const apiHost = getApiHost();
  const url = `${apiHost}/docs/json`;
  const config = {
    url,
    theme: 'alternate',
    customCss: `.scalar-app .h-dvh{height: calc(100dvh - 58px); top: 58px}`,
    defaultHttpClient: {
      targetKey: 'node',
      clientKey: 'fetch',
    },
  };
  return <ScalarAPI config={config} />;
}
