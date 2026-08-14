# VidFetch Supported Platform Compliance & Capabilities Policy

VidFetch is committed to operating a legal, secure, and respectful media processing platform. We enforce strict technical and policy boundaries regarding media sources.

---

## 1. Compliance & Permitted Access Policy

VidFetch **ONLY** processes content through permitted, public, and authorized stream retrieval mechanisms.

### Strictly Prohibited Capabilities:
VidFetch does **NOT** support, attempt, or implement:
- ❌ Digital Rights Management (DRM) bypass
- ❌ Private content or paywall circumvention
- ❌ Account authentication harvesting / cookie stealing
- ❌ CAPTCHA bypass mechanisms
- ❌ Access control circumvention
- ❌ Private or password-protected video extraction

If a source stream is protected by DRM, paywall, or private access controls, VidFetch will immediately reject the request and return:
```json
{
  "success": false,
  "error": "CONTENT_NOT_SUPPORTED",
  "message": "This content format or protected stream cannot be processed."
}
```

---

## 2. Platform Capabilities Matrix

| Platform | Primary Domain | Video Download | Audio Extraction | Max Resolution | Direct Download |
|---|---|---|---|---|---|
| **YouTube** | `youtube.com`, `youtu.be` | ✅ Supported | ✅ Supported | 1080p Full HD | ✅ Yes |
| **Vimeo** | `vimeo.com` | ✅ Supported | ✅ Supported | 1080p Full HD | ✅ Yes |
| **TikTok** | `tiktok.com` | ✅ Supported | ✅ Supported | 1080p HD | ✅ Yes |
| **Web Stream** | Generic HTTP / HTTPS Streams | ✅ Supported | ✅ Supported | 720p HD | ✅ Yes |

---

## 3. User Responsibility & Copyright Notice

Users are strictly required to possess proper ownership or explicit authorization from copyright holders before processing or downloading media via VidFetch. 

VidFetch does not grant copyright licenses or authorization to download third-party copyrighted materials. All processing operations comply with applicable copyright laws and platform terms of service.
