(function() {
  'use strict';
  
  // Get script element and project ID
  var script = document.currentScript;
  if (!script) {
    console.error('[Dexio] Nie można pobrać elementu script');
    return;
  }
  
  var projectId = script.getAttribute('data-project');
  if (!projectId) {
    console.error('[Dexio] Brak atrybutu data-project');
    return;
  }
  
  // Get API URL (with fallback to production)
  var apiUrl = script.getAttribute('data-api') || 'https://dexio.pl/api/schema';
  
  // Fetch schemas
  fetch(apiUrl + '?projectId=' + projectId)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      return response.json();
    })
    .then(function(schemas) {
      if (!Array.isArray(schemas) || schemas.length === 0) {
        console.warn('[Dexio] Brak aktywnych schematów dla projektu ' + projectId);
        return;
      }
      
      // Inject each schema into <head>
      schemas.forEach(function(schema, index) {
        var scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.id = 'dexio-schema-' + index;
        scriptTag.textContent = JSON.stringify(schema);
        document.head.appendChild(scriptTag);
      });
      
      console.log('[Dexio] Załadowano ' + schemas.length + ' schematów');
    })
    .catch(function(error) {
      console.error('[Dexio] Błąd ładowania schematów:', error);
    });
})();
