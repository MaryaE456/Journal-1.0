@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  -webkit-font-smoothing: antialiased;
}

/* subtle paper grain, layered on any element via bg-noise */
.bg-noise {
  background-image: radial-gradient(rgba(62, 44, 35, 0.05) 1px, transparent 1px);
  background-size: 3px 3px;
}

.bg-kraft-texture {
  background-color: #b98a5e;
  background-image:
    radial-gradient(rgba(62, 44, 35, 0.08) 1px, transparent 1px),
    linear-gradient(135deg, rgba(94, 64, 40, 0.15), rgba(94, 64, 40, 0));
  background-size: 3px 3px, 100% 100%;
}

.bg-lined-page {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 27px,
    rgba(62, 44, 35, 0.12) 28px
  );
}

.bg-grid-page {
  background-image:
    linear-gradient(rgba(62, 44, 35, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(62, 44, 35, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* torn-paper edge, used on the outer border of photo frames + page edges */
.torn-top {
  clip-path: polygon(
    0% 6%, 4% 2%, 8% 7%, 13% 1%, 18% 5%, 23% 0%, 29% 6%, 34% 2%, 40% 6%,
    46% 1%, 52% 5%, 58% 0%, 64% 6%, 70% 2%, 76% 6%, 82% 1%, 88% 5%, 94% 0%, 100% 5%,
    100% 100%, 0% 100%
  );
}

.torn-bottom {
  clip-path: polygon(
    0% 0%, 100% 0%,
    100% 95%, 94% 100%, 88% 95%, 82% 99%, 76% 94%, 70% 98%, 64% 94%,
    58% 100%, 52% 95%, 46% 99%, 40% 94%, 34% 98%, 29% 94%, 23% 100%, 18% 95%, 13% 99%, 8% 93%, 4% 98%, 0% 94%
  );
}

.washi-corner::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 16px;
  width: 60px;
  height: 22px;
  background: rgba(232, 196, 104, 0.75);
  transform: rotate(-4deg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(94, 64, 40, 0.35);
  border-radius: 8px;
}
