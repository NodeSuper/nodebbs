import ScalarAPI from '@/components/common/ScalarAPI';

export default function ApiReference() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/docs/json`;
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
