'use client'

import { useEffect, useRef } from 'react'


export default function Widget({
  src,
  id,
  env,
  version,
  uid,
  uuid,
  color,
  text,
  title
}) {
  const shouldRender = uid || uuid

  useEffect(() => {
    if (!shouldRender) return

    const script = document.createElement('script')
    script.src = src || 'https://cdn.wetravel.com/widgets/embed_calendar.js'
    script.id = id || 'wetravel_embed_calendar'
    script.async = true

    script.dataset.env = env || 'https://www.wetravel.com'
    script.dataset.version = version || 'v0.3'
    script.dataset.uid = uid || ''
    script.dataset.uuid = uuid || ''
    script.dataset.color = color || 'fb3d3d'
    script.dataset.text = text || 'Book Now'
    script.dataset.title = title || 'Select Departure Date'

    const container = document.getElementById('wetravel_container')
    if (container) {
      container.appendChild(script)
    }

    return () => {
      if (container && script.parentNode) {
        container.removeChild(script)
      }
    }
  }, [src, id, env, version, uid, uuid, color, text, title, shouldRender])

  if (!shouldRender) return null

  return (
      <div id="wetravel_container" className="w-full" />
  )
}

export function TripAdvisorReviews() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = "https://elfsightcdn.com/platform.js"
    script.async = true
    const container = document.getElementById('tar')
    if (container) {
      container.appendChild(script)
    }

    return () => {
      if (container && script.parentNode) {
        container.removeChild(script)
      }
    }
  }, [])

  return (
    <div id="tar" className="w-full">
      <div className="elfsight-app-e3d9c5c8-5920-4343-9e34-e0a1074552f3" data-elfsight-app-lazy></div>
    </div>
  )
}





export function TripAdvisorReviewWidget({
  uniq,
  locationId,
  lang = 'en_IN',
  rating = true,
  nreviews = 5,
  writereviewlink = true,
  popIdx = true,
  iswide = false,
  border = true,
  display_version = 2,
  className = 'w-full'
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const widgetId = `TA_selfserveprop${uniq}`

    // Create the placeholder div
    const widgetDiv = document.createElement('div')
    widgetDiv.id = widgetId
    widgetDiv.className = 'TA_selfserveprop'

    const ul = document.createElement('ul')
    ul.id = `TA_links_${uniq}`
    ul.className = 'TA_links'

    const li = document.createElement('li')
    li.id = `TA_li_${uniq}`
    li.className = 'TA_li'

    const link = document.createElement('a')
    link.target = '_blank'
    link.href = `https://www.tripadvisor.in/Attraction_Review-g304552-d${locationId}-Reviews-India_Escapes-Shimla_Shimla_District_Himachal_Pradesh.html`

    const img = document.createElement('img')
    img.src = 'https://www.tripadvisor.in/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg'
    img.alt = 'TripAdvisor'

    link.appendChild(img)
    li.appendChild(link)
    ul.appendChild(li)
    widgetDiv.appendChild(ul)
    container.appendChild(widgetDiv)

    // Use the correct TripAdvisor WidgetEmbed URL with defer to avoid document.write issues
    const script = document.createElement('script')
    script.defer = true
    script.src = `https://www.tripadvisor.com/WidgetEmbed-selfserveprop?border=${border}&popIdx=${popIdx}&iswide=${iswide}&locationId=${locationId}&display_version=${display_version}&uniq=${uniq}&rating=${rating}&lang=${lang}&nreviews=${nreviews}&writereviewlink=${writereviewlink}`

    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [uniq, locationId, lang, rating, nreviews, writereviewlink, popIdx, iswide, border, display_version])

  return <div ref={containerRef} className={className} />
}