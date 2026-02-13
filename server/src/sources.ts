import fetch from 'node-fetch';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchTwitterMentions(vip: string, bearer: string) {
  const url = new URL('https://api.twitter.com/2/tweets/search/recent');
  url.searchParams.set('query', `(${vip} OR @${vip.replace(/\s+/g, '')}) -is:retweet -is:reply lang:en`);
  url.searchParams.set('tweet.fields', 'created_at,lang,author_id,public_metrics');
  url.searchParams.set('expansions', 'author_id,attachments.media_keys');
  url.searchParams.set('media.fields', 'preview_image_url,url');
  const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${bearer}` } });
  if (!resp.ok) throw new Error(`Twitter API failed: ${resp.status}`);
  return resp.json();
}

export async function fetchTweetById(id: string, bearer: string) {
  const url = new URL(`https://api.twitter.com/2/tweets/${id}`);
  url.searchParams.set('tweet.fields', 'created_at,lang,public_metrics,entities');
  url.searchParams.set('expansions', 'attachments.media_keys,author_id');
  url.searchParams.set('media.fields', 'preview_image_url,url');
  const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${bearer}` } });
  if (!resp.ok) throw new Error(`Twitter API (by id) failed: ${resp.status}`);
  return resp.json();
}

export async function fetchYouTubeMentions(vip: string, apiKey: string) {
  const search = new URL('https://www.googleapis.com/youtube/v3/search');
  search.searchParams.set('part', 'snippet');
  search.searchParams.set('q', vip);
  search.searchParams.set('type', 'video');
  search.searchParams.set('maxResults', '10');
  search.searchParams.set('key', apiKey);
  const resp = await fetch(search.toString());
  if (!resp.ok) throw new Error(`YouTube API failed: ${resp.status}`);
  return resp.json();
}

export async function fetchYouTubeVideoById(id: string, apiKey: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('id', id);
  url.searchParams.set('key', apiKey);
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`YouTube videos API failed: ${resp.status}`);
  return resp.json();
}

export function extractPlatformAndIds(inputUrl: string): { platform: 'Twitter' | 'YouTube' | 'Web'; tweetId?: string; videoId?: string } {
  try {
    const u = new URL(inputUrl);
    const host = u.hostname.toLowerCase();
    // Twitter/X
    if (host.includes('twitter.com') || host.includes('x.com')) {
      // Match /status/<id>
      const m = u.pathname.match(/status\/(\d+)/);
      if (m?.[1]) return { platform: 'Twitter', tweetId: m[1] };
      return { platform: 'Twitter' };
    }
    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let id = '';
      if (host.includes('youtu.be')) id = u.pathname.replace(/^\//, '');
      else id = u.searchParams.get('v') || '';
      if (id) return { platform: 'YouTube', videoId: id };
      return { platform: 'YouTube' };
    }
    return { platform: 'Web' };
  } catch {
    return { platform: 'Web' };
  }
}

export async function fetchUrlContent(url: string): Promise<{ text: string; title?: string; image?: string; platform: string }>{
  try {
    const resp = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 AuraShieldBot' } });
    const html = resp.data as string;
    const $ = cheerio.load(html);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const desc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const platform = /youtube\.com|youtu\.be/.test(url) ? 'YouTube' : /twitter\.com|x\.com/.test(url) ? 'Twitter' : 'Web';
    const text = [title, desc].filter(Boolean).join('\n');
    return { text, title, image: ogImage, platform };
  } catch {
    return { text: url, platform: 'Web' };
  }
}

