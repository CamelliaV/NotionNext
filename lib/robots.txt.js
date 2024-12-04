import fs from 'fs';

export async function generateRobotsTxt(props) {
  const { siteInfo } = props;
  const LINK = siteInfo?.link || 'https://camelliav.netlify.app'; // Default to a valid URL if LINK is not provided

  const content = `
User-agent: *
Allow: /

# Host
Host: ${LINK}

# Sitemaps
Sitemap: ${LINK}/sitemap.xml
`.trim();

  try {
    fs.mkdirSync('./public', { recursive: true });
    fs.writeFileSync('./public/robots.txt', content);
    console.log('robots.txt generated successfully');
  } catch (error) {
    console.error('Failed to write robots.txt:', error.message);
  }
}
