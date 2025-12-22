(function() {
  'use strict';
  
  // Get script element and project ID
  var script = document.currentScript;
  if (!script) {
    console.error('[DexAi] Nie można pobrać elementu script');
    return;
  }
  
  var projectId = script.getAttribute('data-project');
  if (!projectId) {
    console.error('[DexAi] Brak atrybutu data-project');
    return;
  }
  
  // Get API URL (with fallback to production) - use schema-html endpoint
  var apiUrl = script.getAttribute('data-api') || 'https://dexai.pl/api/schema-html';
  
  // Ensure we're using schema-html endpoint
  if (apiUrl.endsWith('/api/schema')) {
    apiUrl = apiUrl.replace('/api/schema', '/api/schema-html');
  }
  
  // Fetch HTML with schemas and meta tags
  fetch(apiUrl + '?projectId=' + projectId + '&_=' + Date.now())
    .then(function(response) {
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      return response.text();
    })
    .then(function(html) {
      if (!html || html.includes('<!-- Brak aktywnych')) {
        console.warn('[DexAi] Brak aktywnych schematów dla projektu ' + projectId);
        return;
      }
      
      // Create a temporary container to parse HTML
      var temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Inject all elements (script tags and meta tags) into <head>
      var count = 0;
      Array.prototype.forEach.call(temp.children, function(element) {
        var clone = element.cloneNode(true);
        document.head.appendChild(clone);
        count++;
      });
      
      console.log('[DexAi] Załadowano ' + count + ' elementów (schematy + meta tagi)');
    })
    .catch(function(error) {
      console.error('[DexAi] Błąd ładowania schematów:', error);
    });
})();
