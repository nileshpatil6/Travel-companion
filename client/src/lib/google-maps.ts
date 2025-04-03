declare global {
  interface Window {
    google: any;
  }
}

export const initGoogleMaps = () => {
  if (!window.google) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=$API&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}; 
