/**
 * 通用复制到剪贴板功能
 * 兼容所有浏览器，包括不支持 Clipboard API 的环境
 */

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // 优先使用现代 clipboard API（需要 HTTPS 或 localhost）
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级到传统方法
      fallbackCopyToClipboard(text);
      return true;
    }
  } catch (error) {
    console.error('复制失败:', error);
    // 尝试降级方法
    try {
      fallbackCopyToClipboard(text);
      return true;
    } catch (fallbackError) {
      console.error('降级复制也失败:', fallbackError);
      return false;
    }
  }
};

/**
 * 传统复制方法（兼容所有浏览器）
 * 使用 document.execCommand('copy')
 */
export const fallbackCopyToClipboard = (text: string): void => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // 设置样式使其不可见
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  // 尝试执行复制命令
  const successful = document.execCommand('copy');
  document.body.removeChild(textArea);
  
  if (!successful) {
    throw new Error('复制命令执行失败');
  }
};

/**
 * 带反馈的复制功能
 */
export const copyWithFeedback = async (
  text: string,
  onSuccess?: () => void,
  onError?: (error: string) => void,
  feedbackDelay: number = 2000
): Promise<boolean> => {
  const success = await copyToClipboard(text);
  
  if (success) {
    if (onSuccess) onSuccess();
    return true;
  } else {
    const errorMessage = '复制失败，请手动选择文本复制';
    if (onError) onError(errorMessage);
    else alert(errorMessage);
    return false;
  }
};

export default {
  copyToClipboard,
  fallbackCopyToClipboard,
  copyWithFeedback
};