import { JournalPage } from "@/lib/types";
import { PAGE_BACKGROUNDS } from "@/lib/fontMap";
import ElementContent from "./ElementContent";

export default function PagePreview({ page }: { page: JournalPage }) {
  const bg = PAGE_BACKGROUNDS.find((b) => b.key === page.background)?.className ?? "bg-paper";

  return (
    <div className={`relative w-full h-full overflow-hidden ${bg}`}>
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
