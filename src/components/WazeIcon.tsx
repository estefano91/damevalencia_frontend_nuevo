// Waze Official Icon Component
const WazeIcon = ({ width = 20, height = 20 }: { width?: number; height?: number }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Círculo de fondo Waze - color oficial */}
      <circle cx="12" cy="12" r="10" fill="#33CCFF" />
      {/* Ojo izquierdo */}
      <circle cx="9" cy="10" r="1.5" fill="#FFFFFF" />
      {/* Ojo derecho */}
      <circle cx="15" cy="10" r="1.5" fill="#FFFFFF" />
      {/* Sonrisa */}
      <path
        d="M9 14.5c0 1.66 1.34 3 3 3s3-1.34 3-3"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default WazeIcon;

