// Small, professional line icons (Lucide-style, MIT). They use `currentColor`
// so they adapt to the surrounding text colour in light and dark mode.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
}

// Open book — used for the site logo.
export function BookIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

// Cube — "Building Blocks".
export function BlocksIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

// Binary — "Operators".
export function OperatorsIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="14" y="14" width="4" height="6" rx="2" />
      <rect x="6" y="4" width="4" height="6" rx="2" />
      <path d="M6 20h4" />
      <path d="M14 10h4" />
      <path d="M6 14h2v6" />
      <path d="M14 4h2v6" />
    </svg>
  )
}

// Signpost / fork — "Making Decisions".
export function DecisionsIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M12 3v18" />
      <path d="M3 9h13l3-3-3-3H3v6z" />
      <path d="M8 15h9l3 3-3 3H8v-6z" />
    </svg>
  )
}

// Layers — "Core APIs".
export function CoreApisIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
      <path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
    </svg>
  )
}

// Wrench / tool — "Methods".
export function MethodsIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

// Hierarchy / class — "Class Design".
export function ClassDesignIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <rect x="2" y="18" width="6" height="4" rx="1" />
      <rect x="16" y="18" width="6" height="4" rx="1" />
      <path d="M12 6v4" />
      <path d="M5 18v-4h14v4" />
      <path d="M12 10v4" />
    </svg>
  )
}

// Puzzle piece — "Beyond Classes".
export function BeyondClassesIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-3.408 0l-1.569-1.568a.878.878 0 0 0-.878-.29 1.755 1.755 0 0 1-2.108-2.107.877.877 0 0 0-.29-.878L2.19 14.02a2.404 2.404 0 0 1 0-3.408l1.568-1.569a.877.877 0 0 0 .29-.878 1.755 1.755 0 0 1 2.108-2.107.877.877 0 0 0 .878-.29L8.6 4.2a2.404 2.404 0 0 1 3.408 0l1.569 1.568c.23.23.556.338.878.29a1.755 1.755 0 0 1 2.107 2.107z" />
    </svg>
  )
}

// Lambda / function symbol — "Lambdas and Functional Interfaces".
export function LambdasIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="m15 5 3 3" />
    </svg>
  )
}

// Grid / collection — "Collections and Generics".
export function CollectionsIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// Waves / stream — "Streams".
export function StreamsIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
      <path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
    </svg>
  )
}

// Alert triangle — "Exceptions, Formatting, and Localization".
export function ExceptionsIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

// Package / box — "Modules".
export function ModulesIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  )
}
