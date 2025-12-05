import type { SVGProps } from 'react'

export function IconWin98Manual(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="4 3 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="9" y="8" width="28" height="30" rx="2.5" fill="#ffffff"/>
      <rect x="9" y="8" width="7" height="30" fill="#f2f2f6"/>
      {/* 红色三角形 */}
      <polygon points="20 22 26 22 23 16" fill="#ff0000" />
      <path d="M11 29 H35" stroke="#0e012f" strokeWidth="1.4"/>
      <path d="M11 32 H35" stroke="#0e012f" strokeWidth="1.4"/>
      <path d="M11 35 H35" stroke="#0e012f" strokeWidth="1.4"/>
    </svg>
  )
}
