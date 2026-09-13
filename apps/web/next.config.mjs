/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  transpilePackages: ['@snacks/shared'],
  async headers() {
    const noindexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow, noarchive'
      }
    ];

    return ['/admin/:path*', '/vendor/:path*', '/account/:path*', '/cart/:path*', '/checkout/:path*', '/payment/:path*', '/orders/:path*'].map(
      (source) => ({
        source,
        headers: noindexHeaders
      })
    );
  }
};

export default nextConfig;
