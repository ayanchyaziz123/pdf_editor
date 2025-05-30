// components/AutoAds.js
'use client'
import { useEffect } from 'react'

const AutoAds = () => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: "ca-pub-XXXXXXXXXX",
          enable_page_level_ads: true
        })
      }
    } catch (err) {
      console.log('Auto Ads error:', err)
    }
  }, [])

  return null
}

export default AutoAds