(function() {
  try {
    const savedPrimaryColor = localStorage.getItem('helporbit-primary-color');
    // Use next-themes storage for theme detection
    const nextTheme = localStorage.getItem('theme');
    
    if (savedPrimaryColor) {
      const root = document.documentElement;
      // Check next-themes or fallback to our storage
      const isDark = nextTheme === 'dark' || (!nextTheme && localStorage.getItem('helporbit-theme-mode') === 'dark');
      
      // Apply primary color immediately
      root.style.setProperty('--brand-primary', savedPrimaryColor);
      
      // Generate RGB values
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(savedPrimaryColor);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        
        root.style.setProperty('--brand-primary-rgb', r + ', ' + g + ', ' + b);
        
        // Set transparency variations
        root.style.setProperty('--brand-primary-50', 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (isDark ? 0.1 : 0.05) + ')');
        root.style.setProperty('--brand-primary-100', 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (isDark ? 0.15 : 0.1) + ')');
        root.style.setProperty('--brand-primary-200', 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (isDark ? 0.25 : 0.2) + ')');
        root.style.setProperty('--brand-primary-300', 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (isDark ? 0.35 : 0.3) + ')');
        root.style.setProperty('--brand-primary-500', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)');
        root.style.setProperty('--brand-primary-700', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.7)');
        root.style.setProperty('--brand-primary-900', 'rgba(' + r + ', ' + g + ', ' + b + ', 0.9)');
        
        // Generate accent color
        const darkerR = Math.max(0, Math.floor(r * 0.8));
        const darkerG = Math.max(0, Math.floor(g * 0.8));
        const darkerB = Math.max(0, Math.floor(b * 0.8));
        root.style.setProperty('--brand-accent', 'rgb(' + darkerR + ', ' + darkerG + ', ' + darkerB + ')');
      }
    }
    
    // Note: next-themes will handle the theme class application
  } catch (e) {
    // Silently fail if localStorage is not available
  }
})();