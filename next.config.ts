/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                'postcss-import',
                'postcss-nesting',
                'tailwindcss',
                'autoprefixer',
              ],
            },
          },
        },
      ],
    });
    return config;
  },
}

export default nextConfig 