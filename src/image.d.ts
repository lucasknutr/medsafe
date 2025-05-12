declare module '*.png' {
  const value: string; // Or 'any' if you prefer, 'string' is often used for image paths/urls
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string; // For SVGs, you might use React.FC<React.SVGProps<SVGSVGElement>> if using svgr
  export default value;
}