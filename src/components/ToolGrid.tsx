import { TOOLS, Tool, Language, TRANSLATIONS } from '../types';

interface ToolGridProps {
  currentLang: Language;
  onSelectTool: (toolId: string) => void;
}

export default function ToolGrid({ currentLang, onSelectTool }: ToolGridProps) {
  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';

  return (
    <div className="grid grid-cols-1 gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4" id="tools-grid-container">
      {TOOLS.map((tool: Tool) => {
        const isLive = tool.live;
        const name = t(tool.nameKey);
        const desc = t(tool.descKey);

        return (
          <button
            key={tool.id}
            onClick={() => isLive && onSelectTool(tool.id)}
            disabled={!isLive}
            className={`group relative flex flex-col justify-between bg-panel p-6 min-h-[200px] text-left transition-all duration-200 outline-none ${
              isLive
                ? 'cursor-pointer hover:bg-paper/50 focus-visible:ring-2 focus-visible:ring-brass'
                : 'cursor-not-allowed opacity-60'
            }`}
            id={`tool-card-${tool.id}`}
          >
            {/* Status Badge */}
            <span
              className={`absolute top-5 right-5 font-mono text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded ${
                isLive
                  ? 'bg-teal/10 text-teal'
                  : 'bg-muted/10 text-muted'
              }`}
            >
              {isLive ? 'Live · Web' : 'Soon'}
            </span>

            {/* Content */}
            <div className="mt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border-[1.5px] border-ink font-mono text-sm font-semibold text-ink group-hover:border-brass group-hover:text-brass transition-colors mb-5">
                {tool.letter}
              </div>
              <h3 className="font-serif text-lg font-bold text-ink mb-2 group-hover:text-brass transition-colors">
                {name}
              </h3>
              <p className="font-sans text-[13px] leading-relaxed text-muted">
                {desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
