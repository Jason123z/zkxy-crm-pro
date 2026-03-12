/**
 * 彻底移除 clsx 和 tailwind-merge 依赖
 * 避免因库加载失败导致的组件崩溃闪退
 */
export function cn(...inputs: any[]) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ');
}
