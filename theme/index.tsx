import { Layout as BaseLayout, PackageManagerTabs } from '@rspress/core/theme-original';

function HomeInstall() {
  return (
    <div
      className='home-install'
      style={{ maxWidth: 800, margin: '0 auto 48px', padding: '0 24px' }}
    >
      <PackageManagerTabs command='install @monetr/notify' />
    </div>
  );
}

function Layout() {
  return <BaseLayout afterHero={<HomeInstall />} />;
}

export * from '@rspress/core/theme-original';
export { Layout };
