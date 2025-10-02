(function() {
  try {
    const savedPrimaryColor = localStorage.getItem('helporbit-primary-color');
    
    if (savedPrimaryColor) {
      const root = document.documentElement;
      
      // Apply primary color immediately - this prevents the flash
      root.style.setProperty('--brand-primary', savedPrimaryColor);
      
      // Generate RGB values
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(savedPrimaryColor);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        
        root.style.setProperty('--brand-primary-rgb', r + ', ' + g + ', ' + b);
        
        // Set transparency variations (we'll update these later based on actual theme)
        root.style.setProperty('--brand-primary-50', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.05)');
        root.style.setProperty('--brand-primary-100', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.1)');
        root.style.setProperty('--brand-primary-200', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.2)');
        root.style.setProperty('--brand-primary-300', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.3)');
        root.style.setProperty('--brand-primary-500', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)');
        root.style.setProperty('--brand-primary-700', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.7)');
        root.style.setProperty('--brand-primary-900', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.9)');
        
        // Generate accent color
        const darkerR = Math.max(0, Math.floor(r * 0.8));
        const darkerG = Math.max(0, Math.floor(g * 0.8));
        const darkerB = Math.max(0, Math.floor(b * 0.8));
        root.style.setProperty('--brand-accent', 'rgb(' + darkerR + ', ' + darkerG + ', ' + darkerB + ')');
      }
    } else {
      // Set default blue color if no organization color is saved
      root.style.setProperty('--brand-primary', '#3b82f6');
      root.style.setProperty('--brand-primary-rgb', '59, 130, 246');
    }
  } catch {
    // Silently fail if localStorage is not available
  }
})();