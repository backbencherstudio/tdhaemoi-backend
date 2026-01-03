// export const getImageUrl = (imagePath: string) => {
//     const baseUrl = (process.env.APP_URL || '').trim();
//     const path = (imagePath || '').trim();
//     // Remove leading slash from path if baseUrl already ends with slash, or add slash if needed
//     const cleanPath = path.startsWith('/') ? path : `/${path}`;
//     const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
//     return `${cleanBaseUrl}${cleanPath}`;
//   };



export const getImageUrl = (imagePath: string) => {
  const baseUrl = (process.env.APP_URL || '').trim();
  const path = (imagePath || '').trim();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}${cleanPath}`;
};
  
  export const baseUrl = (process.env.APP_URL || '').trim();
  