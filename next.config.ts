   /** @type {import('next').NextConfig} */
   const nextConfig = {
     images: {
       remotePatterns: [
         // 노션 업로드 이미지, 알라딘 책 표지 등 모든 https 이미지 허용
         { protocol: "https", hostname: "**" },
       ],
     },
   };

   export default nextConfig;