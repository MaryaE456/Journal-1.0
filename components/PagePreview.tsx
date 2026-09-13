import { JournalPage } from "@/lib/types";
import { BACKGROUND_STYLES } from "@/lib/fontMap";
import ElementContent from "./ElementContent";

export default function PagePreview({ page }: { page: JournalPage }) {
  const pattern = BACKGROUND_STYLES.find((b) => b.key === page.background.style)?.patternClassName ?? "";

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${pattern}`}
      style={{ backgroundColor: page.background.color }}
    >
      {[...page.elements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              transform: `rotate(${el.rotation}deg)`,
            }}
          >
            <ElementContent element={el} />
          </div>
        ))}
    </div>
  );
}
