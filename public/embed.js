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
      
      // Get existing schema types on the page
      var existingSchemas = [];
      var existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      Array.prototype.forEach.call(existingScripts, function(script) {
        try {
          var data = JSON.parse(script.textContent);
          var type = data['@type'];
          if (type) {
            // Handle both single type and array of types
            if (Array.isArray(type)) {
              existingSchemas = existingSchemas.concat(type);
            } else {
              existingSchemas.push(type);
            }
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      });
      
      // Get existing meta tags
      var existingMetas = {};
      var existingMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="description"]');
      Array.prototype.forEach.call(existingMetaTags, function(meta) {
        var key = meta.getAttribute('property') || meta.getAttribute('name');
        if (key) {
          existingMetas[key] = true;
        }
      });
      
      // Create a temporary container to parse HTML
      var temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Inject elements while checking for duplicates
      var addedCount = 0;
      var skippedCount = 0;
      
      Array.prototype.forEach.call(temp.children, function(element) {
        var shouldAdd = true;
        var reason = '';
        
        // Check if it's a schema script
        if (element.tagName === 'SCRIPT' && element.type === 'application/ld+json') {
          try {
            var data = JSON.parse(element.textContent);
            var type = data['@type'];
            
            if (type) {
              var types = Array.isArray(type) ? type : [type];
              var duplicateTypes = types.filter(function(t) {
                return existingSchemas.indexOf(t) !== -1;
              });
              
              if (duplicateTypes.length > 0) {
                shouldAdd = false;
                reason = 'Schema ' + duplicateTypes.join(', ') + ' już istnieje na stronie';
              }
            }
          } catch (e) {
            // Invalid JSON, add anyway
          }
        }
        
        // Check if it's a meta tag
        if (element.tagName === 'META') {
          var key = element.getAttribute('property') || element.getAttribute('name');
          if (key && existingMetas[key]) {
            shouldAdd = false;
            reason = 'Meta tag ' + key + ' już istnieje na stronie';
          }
        }
        
        if (shouldAdd) {
          var clone = element.cloneNode(true);
          document.head.appendChild(clone);
          addedCount++;
        } else {
          skippedCount++;
          if (reason) {
            console.log('[DexAi] Pominięto duplikat: ' + reason);
          }
        }
      });
      
      console.log('[DexAi] Załadowano ' + addedCount + ' elementów, pominięto ' + skippedCount + ' duplikatów');
    })
    .catch(function(error) {
      console.error('[DexAi] Błąd ładowania schematów:', error);
    });
})();
