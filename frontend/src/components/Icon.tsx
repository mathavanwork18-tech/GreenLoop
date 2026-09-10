import React from 'react'

export type IconName =
  | 'home'
  | 'map'
  | 'plus'
  | 'activity'
  | 'user'
  | 'search'
  | 'recycle'
  | 'repair'
  | 'shop'
  | 'pickup'
  | 'battery'
  | 'phone'
  | 'laptop'
  | 'tablet'
  | 'camera'
  | 'ai'
  | 'sparkles'
  | 'coin'
  | 'verified'
  | 'star'
  | 'trophy'
  | 'medal'
  | 'flame'
  | 'bell'
  | 'gift'
  | 'settings'
  | 'filter'
  | 'close'
  | 'arrow-right'
  | 'arrow-left'
  | 'bookmark'
  | 'help'
  | 'certificate'
  | 'share'
  | 'print'
  | 'tree'
  | 'leaf'
  | 'headphones'
  | 'heart'
  | 'comment'
  | 'send'
  | 'alert'
  | 'school'
  | 'building'
  | 'check'
  | 'sun'
  | 'moon'
  | 'target'
  | 'location-pin'
  | 'phone-call'
  | 'image'
  | 'flash'
  | 'trash'
  | 'refresh'
  | 'package'
  | 'shield'
  | 'chart'
  | 'clock'
  | 'download'
  | 'install'
  | 'monitor'
  | 'smartphone'
  | 'zap'
  | 'offline'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Green Loop Centralized Flaticon Icon Component
 * Source: https://www.flaticon.com/
 * All vector paths sourced from Flaticon vector asset collection.
 * Transparent background, fully scalable vector graphics.
 */
export default function Icon({
  name,
  size = 20,
  color = 'currentColor',
  className = '',
  style = {}
}: IconProps) {
  const getSvgContent = () => {
    switch (name) {
      case 'home':
        return (
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />
        )
      case 'map':
        return (
          <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill={color} />
        )
      case 'plus':
        return (
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={color} />
        )
      case 'activity':
      case 'flash':
        return (
          <path d="M7 2v11h3v9l7-12h-4l4-8z" fill={color} />
        )
      case 'user':
        return (
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} />
        )
      case 'search':
        return (
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill={color} />
        )
      case 'recycle':
        return (
          <path d="M7 6.5L4 9.5h2c0 3.31 2.69 6 6 6 .74 0 1.45-.14 2.1-.38l-1.54-1.54C12.37 13.8 12.19 14 12 14c-2.21 0-4-1.79-4-4H10L7 6.5zm10.5 7L20 10.5h-2c0-3.31-2.69-6-6-6-.74 0-1.45.14-2.1.38l1.54 1.54C11.63 6.2 11.81 6 12 6c2.21 0 4 1.79 4 4h-2l3.5 3.5zm-5-3.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill={color} />
        )
      case 'repair':
        return (
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill={color} />
        )
      case 'shop':
        return (
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" fill={color} />
        )
      case 'pickup':
        return (
          <path d="M20 8h-3V4H1v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill={color} />
        )
      case 'battery':
        return (
          <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z" fill={color} />
        )
      case 'phone':
        return (
          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-5 1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill={color} />
        )
      case 'laptop':
        return (
          <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill={color} />
        )
      case 'tablet':
        return (
          <path d="M19 0H5C3.34 0 2 1.34 2 3v18c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zm-7 22c-.83 0-1.5-.67-1.5-1.5S11.17 19 12 19s1.5.67 1.5 1.5S12.83 22 12 22zm6-4H6V3h12v15z" fill={color} />
        )
      case 'camera':
        return (
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill={color} />
        )
      case 'ai':
      case 'sparkles':
        return (
          <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2zm7 13l1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15zM5 15l1.2 2.8L9 19l-2.8 1.2L5 23l-1.2-2.8L1 19l2.8-1.2L5 15z" fill={color} />
        )
      case 'coin':
        return (
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-1.12c-1.39-.28-2.5-1.33-2.5-2.88h1.8c0 .77.63 1.4 1.7 1.4 1.02 0 1.6-.54 1.6-1.2 0-.82-.6-1.16-1.9-1.63-1.63-.58-2.7-1.32-2.7-2.82 0-1.34.98-2.38 2.5-2.7V4.5h2v1.1c1.19.24 2.12 1.05 2.29 2.4h-1.8c-.14-.59-.59-1-1.49-1-.87 0-1.4.45-1.4 1.05 0 .7.54 1.02 1.8 1.48 1.74.62 2.8 1.34 2.8 2.92 0 1.48-1.11 2.52-2.7 2.85v1.2z" fill={color} />
        )
      case 'verified':
      case 'shield':
        return (
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill={color} />
        )
      case 'star':
        return (
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={color} />
        )
      case 'trophy':
        return (
          <path d="M19 3H5c-1.1 0-2 .9-2 2v4c0 3.86 3.14 7 7 7v2H8v2h8v-2h-2v-2c3.86 0 7-3.14 7-7V5c0-1.1-.9-2-2-2zm-14 6V5h2v4c0 2.21-1.79 4-2 4zm14 0c-.21 0-2-1.79-2-4V5h2v4z" fill={color} />
        )
      case 'medal':
        return (
          <path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c-3.87 0-7 3.13-7 7v1h14v-1c0-3.87-3.13-7-7-7z" fill={color} />
        )
      case 'flame':
        return (
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM12 20c-3.31 0-6-2.69-6-6 0-1.53.58-2.98 1.63-4.08.38 1.49 1.72 2.58 3.37 2.58 1.84 0 3.33-1.49 3.33-3.33 0-.49-.11-.96-.3-1.38 2.37 1.47 3.97 4.09 3.97 7.21 0 3.31-2.69 6-6 6z" fill={color} />
        )
      case 'bell':
        return (
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill={color} />
        )
      case 'gift':
        return (
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1h-2v-1c0-.55.45-1 1-1zM9 4c.55 0 1 .45 1 1v1H8c-.55 0-1-.45-1-1s.45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z" fill={color} />
        )
      case 'settings':
        return (
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill={color} />
        )
      case 'filter':
        return (
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill={color} />
        )
      case 'close':
        return (
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill={color} />
        )
      case 'arrow-right':
        return (
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={color} />
        )
      case 'arrow-left':
        return (
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
        )
      case 'bookmark':
        return (
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill={color} />
        )
      case 'help':
        return (
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" fill={color} />
        )
      case 'certificate':
        return (
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill={color} />
        )
      case 'share':
        return (
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" fill={color} />
        )
      case 'print':
        return (
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" fill={color} />
        )
      case 'tree':
        return (
          <path d="M12 2L4 14h3v6h2v-6h2v6h2v-6h3L12 2z" fill={color} />
        )
      case 'leaf':
        return (
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.57 17.5 9.39 12 17 10V8zm4-6c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 18.5V22h2v-2.17l2.39-1.97C17.93 17.26 19.88 18 22 18c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9z" fill={color} />
        )
      case 'headphones':
        return (
          <path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" fill={color} />
        )
      case 'heart':
        return (
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} />
        )
      case 'comment':
        return (
          <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill={color} />
        )
      case 'send':
        return (
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
        )
      case 'alert':
        return (
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill={color} />
        )
      case 'school':
        return (
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill={color} />
        )
      case 'building':
        return (
          <path d="M4 22V2h10v6h6v14H4zm2-2h6v-2H6v2zm0-4h6v-2H6v2zm0-4h6v-2H6v2zm0-4h6V6H6v2zm12 12h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4v-2h4v2z" fill={color} />
        )
      case 'check':
        return (
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill={color} />
        )
      case 'sun':
        return (
          <path
            d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1zm0 17a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zm10-8h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zM4 11H2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zm14.07-5.66a1 1 0 0 0-1.41 0 1 1 0 0 0 0 1.41l1.42 1.42a1 1 0 0 0 1.41-1.42l-1.42-1.41zM6.34 16.24a1 1 0 0 0-1.41 0l-1.42 1.42a1 1 0 0 0 1.42 1.41l1.41-1.41a1 1 0 0 0 0-1.42zm11.32 1.41a1 1 0 0 0 0-1.41 1 1 0 0 0-1.41 0l-1.42 1.41a1 1 0 0 0 1.41 1.42l1.42-1.42zM7.76 6.34a1 1 0 0 0-1.42-1.41L4.93 6.34a1 1 0 0 0 1.41 1.41l1.42-1.41z"
            fill={color}
          />
        )
      case 'moon':
        return (
          <path
            d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05z"
            fill={color}
          />
        )
      case 'target':
        return (
          <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" fill={color} />
        )
      case 'location-pin':
        return (
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={color} />
        )
      case 'phone-call':
        return (
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill={color} />
        )
      case 'image':
        return (
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill={color} />
        )
      case 'trash':
        return (
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill={color} />
        )
      case 'refresh':
        return (
          <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill={color} />
        )
      case 'package':
        return (
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 12.55l-8-4V17l8 5 8-5v-6.45l-8 4z" fill={color} />
        )
      case 'chart':
        return (
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill={color} />
        )
      case 'clock':
        return (
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-2.69-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill={color} />
        )
      case 'download':
        return (
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill={color} />
        )
      case 'install':
        return (
          <path d="M4 6h16v10H4V6zm16-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h4l-2 2v1h12v-1l-2-2h4c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 9l3-3h-2V7h-2v3H8l3 3z" fill={color} />
        )
      case 'monitor':
        return (
          <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6l-2 2v1h8v-1l-2-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" fill={color} />
        )
      case 'smartphone':
        return (
          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-5 1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill={color} />
        )
      case 'zap':
        return (
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={color} />
        )
      case 'offline':
        return (
          <path d="M22.99 9C21.46 7.46 19.34 6.43 17 6.13V4.08C19.89 4.41 22.48 5.68 24.41 7.58L22.99 9zM1.41 1.6L0 3.01l2.45 2.45C1.56 5.86.75 6.36 0 6.94l12 12.01.01-.01.01.01 4.79-4.8 4.79 4.79 1.41-1.41L1.41 1.6zM12 14.54l-5.6-5.6C7.54 8.35 8.73 8 10 8c1.38 0 2.63.4 3.68 1.08L12 10.74v3.8zM19 12c.55 0 1 .45 1 1v4.17l2 2V13c0-1.66-1.34-3-3-3h-4.17l2 2H19z" fill={color} />
        )
      default:
        return (
          <circle cx="12" cy="12" r="10" fill={color} />
        )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    >
      {getSvgContent()}
    </svg>
  )
}
