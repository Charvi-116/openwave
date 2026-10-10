# OpenWave External API Integration Guide

Legal music sources and integration implementation.

## Approved Music Sources

### 1. Jamendo API

**License:** Free and commercial use (Creative Commons)  
**Website:** https://www.jamendo.com  
**API Docs:** https://developer.jamendo.com

#### Integration Details

```
Endpoint: https://api.jamendo.com/v3.0
Free Tier: 100 requests/minute
Required: API Key (free signup)
```

#### Jamendo License Mapping

| Jamendo License | Our license_type | Streamable? | Attribution Required? |
|---|---|---|---|
| CC BY | CC-BY | ✅ Yes | ✅ Yes |
| CC BY-SA | CC-BY-SA | ✅ Yes | ✅ Yes |
| CC BY-NC | CC-BY-NC | ✅ Yes (non-commercial) | ✅ Yes |
| CC BY-NC-SA | CC-BY-NC-SA | ✅ Yes (non-commercial) | ✅ Yes |
| CC0 (Public Domain) | public-domain | ✅ Yes | ❌ No |

#### Sample API Call

```bash
curl "https://api.jamendo.com/v3.0/tracks?client_id=YOUR_KEY&limit=10&offset=0&order=popularity_week"
```

#### Response Structure

```json
{
  "results": [
    {
      "id": "12345678",
      "name": "Song Title",
      "duration": 180,
      "artist_name": "Artist Name",
      "artist_id": "987654",
      "album_name": "Album Title",
      "album_id": "111111",
      "image": "https://...",
      "audio": "https://usercontent.jamendo.com/download/track/...",
      "audiodownload": "https://usercontent.jamendo.com/download/track/...",
      "license_ccurl": "https://creativecommons.org/licenses/by-nc/3.0/",
      "shareurl": "https://www.jamendo.com/track/12345678",
      "tags": ["ambient", "relaxing"]
    }
  ]
}
```

#### Implementation Example (Node.js)

```typescript
// services/jamendoService.ts

import axios from 'axios';

class JamendoService {
  private apiKey = process.env.JAMENDO_API_KEY;
  private baseUrl = 'https://api.jamendo.com/v3.0';

  async getTracks(options: {
    limit?: number;
    offset?: number;
    genres?: string[];
    order?: string;
  } = {}) {
    const params = {
      client_id: this.apiKey,
      limit: options.limit || 20,
      offset: options.offset || 0,
      format: 'json',
      order: options.order || 'popularity_week',
      ...(options.genres && { tags: options.genres.join('+') })
    };

    const response = await axios.get(`${this.baseUrl}/tracks`, { params });
    return response.data.results.map(track => this.mapTrack(track));
  }

  private mapTrack(jamendoTrack: any) {
    return {
      title: jamendoTrack.name,
      artist_name: jamendoTrack.artist_name,
      duration_ms: jamendoTrack.duration * 1000,
      stream_url: jamendoTrack.audio,
      license_type: this.mapLicense(jamendoTrack.license_ccurl),
      license_url: jamendoTrack.license_ccurl,
      copyright_holder: jamendoTrack.artist_name,
      source_api: 'jamendo',
      external_id: jamendoTrack.id.toString(),
      cover_url: jamendoTrack.image,
      genres: jamendoTrack.tags || [],
      attribution_required: true
    };
  }

  private mapLicense(jamendoLicenseUrl: string): string {
    if (!jamendoLicenseUrl) return 'CC-BY';
    if (jamendoLicenseUrl.includes('cc0')) return 'public-domain';
    if (jamendoLicenseUrl.includes('by-sa')) return 'CC-BY-SA';
    if (jamendoLicenseUrl.includes('by-nc-sa')) return 'CC-BY-NC-SA';
    if (jamendoLicenseUrl.includes('by-nc')) return 'CC-BY-NC';
    return 'CC-BY';
  }
}

export default new JamendoService();
```

---

### 2. Internet Archive Audio Collection

**License:** CC-licensed and public domain  
**Website:** https://archive.org  
**API Docs:** https://archive.org/services/docs/api/  
**Music Collection:** https://archive.org/details/audio

#### Integration Details

```
Endpoint: https://archive.org/advancedsearch.php
Rate Limit: 1 request/second (respectful crawling)
No API key required
```

#### Search Query

Find CC-licensed or public-domain audio:

```
https://archive.org/advancedsearch.php?q=(licenseurl:"creativecommons" OR licenseurl:"cc0" OR mediatype:"etree")&fl=identifier,title,creator,description,licenseurl,metadata,item_size&output=json&rows=100
```

#### Implementation Example (Node.js)

```typescript
// services/internetArchiveService.ts

import axios from 'axios';

class InternetArchiveService {
  private baseUrl = 'https://archive.org/advancedsearch.php';

  async searchAudio(options: {
    limit?: number;
    offset?: number;
    genres?: string[];
  } = {}) {
    const query = this.buildQuery(options.genres);
    const params = {
      q: query,
      fl: 'identifier,title,creator,description,licenseurl,date',
      output: 'json',
      rows: options.limit || 20,
      start: options.offset || 0
    };

    const response = await axios.get(this.baseUrl, { params });
    return response.data.response.docs.map(doc => this.mapTrack(doc));
  }

  private buildQuery(genres?: string[]): string {
    let query = 'mediatype:audio AND (licenseurl:"creativecommons" OR licenseurl:"cc0" OR mediatype:"etree")';
    if (genres?.length) {
      const genreQuery = genres.map(g => `subject:"${g}"`).join(' OR ');
      query += ` AND (${genreQuery})`;
    }
    return query;
  }

  private mapTrack(iaDoc: any) {
    const playUrl = `https://archive.org/download/${iaDoc.identifier}/`;
    
    return {
      title: iaDoc.title || iaDoc.identifier,
      artist_name: iaDoc.creator || 'Unknown',
      duration_ms: 0, // IA doesn't provide duration in search
      stream_url: playUrl, // User must select file; requires MP3 discovery
      license_type: this.mapLicense(iaDoc.licenseurl),
      license_url: iaDoc.licenseurl,
      copyright_holder: iaDoc.creator || 'Unknown',
      source_api: 'internet_archive',
      external_id: iaDoc.identifier,
      cover_url: `https://archive.org/services/img/${iaDoc.identifier}`,
      genres: this.extractGenres(iaDoc.subject || []),
      attribution_required: !(iaDoc.licenseurl?.includes('cc0'))
    };
  }

  private mapLicense(licenseUrl: string): string {
    if (!licenseUrl) return 'unknown';
    if (licenseUrl.includes('cc0') || licenseUrl.includes('publicdomain')) return 'public-domain';
    if (licenseUrl.includes('by-sa')) return 'CC-BY-SA';
    if (licenseUrl.includes('by-nc-sa')) return 'CC-BY-NC-SA';
    if (licenseUrl.includes('by-nc')) return 'CC-BY-NC';
    if (licenseUrl.includes('by')) return 'CC-BY';
    return 'CC-BY';
  }

  private extractGenres(subjects: any[]): string[] {
    if (Array.isArray(subjects)) return subjects.slice(0, 5);
    if (typeof subjects === 'string') return [subjects];
    return [];
  }
}

export default new InternetArchiveService();
```

---

### 3. Wikimedia Commons Audio

**License:** CC and public domain  
**Website:** https://commons.wikimedia.org  
**API Docs:** https://www.mediawiki.org/wiki/API

#### Integration Details

```
Endpoint: https://commons.wikimedia.org/w/api.php
Rate Limit: 1 request/second (user-agent required)
No API key required
```

#### Implementation Example

```typescript
// services/wikimediaService.ts

import axios from 'axios';

class WikimediaService {
  private baseUrl = 'https://commons.wikimedia.org/w/api.php';
  private userAgent = 'OpenWave-MusicApp/1.0 (+https://github.com/openwave)';

  async searchAudio(options: {
    limit?: number;
    offset?: number;
  } = {}) {
    const params = {
      action: 'query',
      list: 'search',
      srsearch: 'filetype:audio',
      srnamespace: 6, // File namespace
      srlimit: options.limit || 20,
      sroffset: options.offset || 0,
      format: 'json'
    };

    const response = await axios.get(this.baseUrl, {
      params,
      headers: { 'User-Agent': this.userAgent }
    });

    // Fetch file info for each result
    const files = await Promise.all(
      response.data.query.search.map(result =>
        this.getFileInfo(result.title)
      )
    );

    return files.filter(f => f !== null);
  }

  private async getFileInfo(fileName: string) {
    const params = {
      action: 'query',
      titles: fileName,
      prop: 'imageinfo|pageterms',
      iiprop: 'url|size|extmetadata',
      pithidden: '1',
      format: 'json'
    };

    const response = await axios.get(this.baseUrl, {
      params,
      headers: { 'User-Agent': this.userAgent }
    });

    const page = Object.values(response.data.query.pages)[0] as any;
    const imageInfo = page.imageinfo?.[0];

    if (!imageInfo || !this.isAudioFile(imageInfo.url)) return null;

    const license = this.extractLicense(imageInfo.extmetadata);

    return {
      title: fileName.replace(/File:/, '').replace(/\.(mp3|ogg|wav)$/i, ''),
      stream_url: imageInfo.url,
      license_type: license,
      source_api: 'wikimedia',
      external_id: fileName,
      copyright_holder: this.extractCredit(imageInfo.extmetadata),
      attribution_required: !license.includes('public-domain')
    };
  }

  private isAudioFile(url: string): boolean {
    return /\.(mp3|ogg|flac|wav)$/i.test(url);
  }

  private extractLicense(metadata: any): string {
    const license = metadata?.LicenseUrl?.value || '';
    if (license.includes('cc0') || license.includes('publicdomain')) return 'public-domain';
    if (license.includes('by-sa')) return 'CC-BY-SA';
    if (license.includes('by')) return 'CC-BY';
    return 'CC-BY';
  }

  private extractCredit(metadata: any): string {
    return metadata?.Artist?.value || metadata?.Creator?.value || 'Wikimedia Commons';
  }
}

export default new WikimediaService();
```

---

## Rate Limiting & Compliance

### Jamendo
- **Limit:** 100 requests/minute (free tier)
- **Best Practice:** Cache responses for 1 hour
- **Seeding:** Run seed job off-peak (e.g., 2 AM daily)
- **Backoff:** On rate limit (HTTP 429), wait and retry with exponential backoff

### Internet Archive
- **Limit:** 1 request/second (crawler delay)
- **Best Practice:** Batch requests into multi-item queries
- **Seeding:** Run seed job with 1-second delays between requests
- **Backoff:** Respect 503 Service Unavailable responses

### Wikimedia Commons
- **Limit:** 1 request/second
- **Best Practice:** Set proper User-Agent header
- **Seeding:** Query one file at a time to avoid rate limits
- **Backoff:** Use exponential backoff for 429/503 responses

## Implementation Checklist

- [ ] Obtain API keys for Jamendo
- [ ] Set up `.env` variables with API keys
- [ ] Implement `jamendoService.ts` with error handling
- [ ] Implement `internetArchiveService.ts`
- [ ] Implement `wikimediaService.ts`
- [ ] Create seed script `seedJamendoTracks.ts`
- [ ] Create seed script `seedPublicDomainTracks.ts`
- [ ] Test stream URLs for accessibility
- [ ] Add license validation to prevent non-streamable content
- [ ] Log all external API calls for debugging
- [ ] Monitor rate limits and adjust seeding schedule
- [ ] Set up weekly refresh job to check link validity
- [ ] Display proper attribution in UI for all sources

## Error Handling

```typescript
// Recommended error recovery

try {
  const tracks = await jamendoService.getTracks();
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limited: wait and retry
    await sleep(60000); // Wait 1 minute
    return retryWithBackoff();
  } else if (error.response?.status === 503) {
    // Service unavailable: use cached data
    return cache.getTracks();
  } else if (error.code === 'ECONNREFUSED') {
    // Network error: use cached data
    return cache.getTracks();
  }
}
```

## Testing

```bash
# Test Jamendo API connection
curl "https://api.jamendo.com/v3.0/tracks?client_id=YOUR_KEY&limit=1"

# Test Internet Archive search
curl "https://archive.org/advancedsearch.php?q=mediatype:audio&rows=1&output=json"

# Test Wikimedia Commons API
curl "https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=filetype:audio&srlimit=1&format=json"
```

---

## Future Expansion

- **Bandcamp API:** Many independent artists allow streaming
- **SoundCloud API:** Limited free tier for metadata
- **Free Music Archive:** Direct feed integration
- **Music Collective APIs:** Royalty-free music services
- **Direct Artist Uploads:** Form for artists to submit CC music
