module.exports = {
  setRandomParams: function(requestParams, context, ee, next) {
    // Symuluj różne projectId i strony
    const projectIds = [
      'test-project-1',
      'test-project-2', 
      'test-project-3',
      'test-project-abc',
      'test-project-xyz'
    ];
    
    const pages = [
      'https://example.com/',
      'https://example.com/about',
      'https://example.com/contact',
      'https://example.com/services',
      'https://example.com/products',
      'https://testsite.pl/',
      'https://testsite.pl/o-nas',
      'https://testsite.pl/cennik'
    ];
    
    context.vars.projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
    context.vars.pageUrl = pages[Math.floor(Math.random() * pages.length)];
    
    return next();
  },
  
  setRandomPage: function(requestParams, context, ee, next) {
    const pages = [
      'https://example.com/',
      'https://example.com/about',
      'https://example.com/services'
    ];
    
    context.vars.pageUrl = pages[Math.floor(Math.random() * pages.length)];
    return next();
  },
  
  checkResponse: function(requestParams, response, context, ee, next) {
    // Sprawdź czy response ma poprawne headery cache
    if (response.headers['cache-control']) {
      ee.emit('counter', 'responses.with_cache_header', 1);
    }
    
    // Sprawdź czy Vercel cache działa
    if (response.headers['x-vercel-cache']) {
      const cacheStatus = response.headers['x-vercel-cache'];
      ee.emit('counter', `vercel_cache.${cacheStatus.toLowerCase()}`, 1);
    }
    
    // Sprawdź response time
    if (response.timings && response.timings.response < 200) {
      ee.emit('counter', 'responses.fast', 1);
    }
    
    return next();
  }
};
