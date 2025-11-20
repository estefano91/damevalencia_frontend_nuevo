// Google Maps Official Icon Component
const GoogleMapsIcon = ({ width = 20, height = 20 }: { width?: number; height?: number }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pin de Google Maps - color oficial */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#4285F4"
      />
      {/* Centro blanco del pin */}
      <circle cx="12" cy="9" r="2" fill="#FFFFFF" />
      {/* Borde del pin */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="#FFFFFF"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
};

export default GoogleMapsIcon;

