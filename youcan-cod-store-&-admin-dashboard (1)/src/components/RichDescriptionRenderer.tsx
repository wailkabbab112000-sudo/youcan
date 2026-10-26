import React from 'react';

interface RichDescriptionRendererProps {
  content: string;
  className?: string;
  isArabic?: boolean;
}

export const RichDescriptionRenderer: React.FC<RichDescriptionRendererProps> = ({
  content,
  className = '',
  isArabic = false,
}) => {
  if (!content) return null;

  // Check if content contains HTML tags
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (!containsHtml) {
    return (
      <div
        className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line ${
          isArabic ? 'font-arabic text-right' : 'text-left'
        } ${className}`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {content}
      </div>
    );
  }

  // If it contains HTML, render with custom styling for COD sales pages
  return (
    <div
      className={`rich-description-area text-sm text-gray-800 leading-relaxed space-y-3 w-full [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-3 [&_img]:block ${
        isArabic ? 'font-arabic text-right' : 'text-left'
      } ${className}`}
      dir={isArabic ? 'rtl' : 'ltr'}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
