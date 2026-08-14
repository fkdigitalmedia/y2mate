import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, FileVideo, FileAudio, BookOpen, Globe } from 'lucide-react';
import { InternalLinkItem } from '@/lib/internal-links';

interface RelatedToolsProps {
  title?: string;
  links: InternalLinkItem[];
}

export default function RelatedTools({
  title = 'Related Tools & Resources',
  links,
}: RelatedToolsProps) {
  if (!links || links.length === 0) return null;

  const getCategoryIcon = (category: InternalLinkItem['category']) => {
    switch (category) {
      case 'tool':
        return <Wrench className="w-4 h-4 text-brand-500" />;
      case 'format':
        return <FileVideo className="w-4 h-4 text-accent-500" />;
      case 'guide':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'platform':
        return <Globe className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto my-12 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {item.category}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
