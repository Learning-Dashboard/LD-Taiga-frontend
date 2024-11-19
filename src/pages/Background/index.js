console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateLocalStorage') {
    chrome.storage.local.set({ logged_in: request.logged_in }, () => {
      console.log(
        'Datos guardados en el almacenamiento local. ' + request.logged_in
      );
    });

    chrome.storage.local.set(
      { proyecto_actual: request.proyecto_actual },
      () => {
        console.log(
          'Datos guardados en el almacenamiento local. ' +
            request.proyecto_actual
        );
      }
    );

    chrome.tabs.query(
      { url: 'https://tree.taiga.io/project/*/timeline' },
      function (tabs) {
        if (tabs.length > 0) {
          tabs.forEach(function (tab) {
            chrome.tabs.reload(tab.id);
          });
        } else {
          // La pestaña no está abierta
          // Puedes abrir la pestaña usando chrome.tabs.create
        }
      }
    );
  }

  if (request.type === 'reloadpage') {
    chrome.tabs.query(
      { url: 'https://tree.taiga.io/project/*/timeline' },
      function (tabs) {
        if (tabs.length > 0) {
          tabs.forEach(function (tab) {
            chrome.tabs.reload(tab.id);
          });
        } else {
          // La pestaña no está abierta
          // Puedes abrir la pestaña usando chrome.tabs.create
        }
      }
    );
  }

  if (request.type === 'updateinnerTabs') {
    chrome.storage.local.set({ extensionTabs: request.extensionTabs }, () => {
      console.log(
        'Datos guardados en el almacenamiento local. ' + request.extensionTabs
      );
    });
  }

  if (request.type === 'getProjectFilters') {
    chrome.storage.local.get('projectFilters', (result) => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ projectFilters: result.projectFilters || [] });
    });
    return true; // Mantener el canal abierto para sendResponse
  }

  if (request.type === 'getQualityFilters') {
    chrome.storage.local.get('qualityFilters', (result) => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ qualityFilters: result.qualityFilters || [] });
    });
    return true;
  }


  if (request.type === 'setProjectFilters') {
    chrome.storage.local.set({ projectFilters: request.projectFilters }, () => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ status: 'success' });
    });
    return true;
  }

  if (request.type === 'setQualityFilters') {
    chrome.storage.local.set({ qualityFilters: request.qualityFilters }, () => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ status: 'success' });
    });
    return true;
  }

  if (request.type === 'getUserFilters') {
    chrome.storage.local.get(request.key, (result) => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ data: result[request.key] || [] });
    });
    return true;
  }

  if (request.type === 'setUserFilters') {
    chrome.storage.local.set({ [request.key]: request.data }, () => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ status: 'success' });
    });
    return true;
  }

  if (request.type === 'getHistoricalFilters') {
    chrome.storage.local.get(request.key, (result) => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ data: result[request.key] });
    });
    return true; 
  }

  if (request.type === 'setHistoricalFilters') {
    chrome.storage.local.set({ [request.key]: request.data }, () => {
      if (chrome.runtime.lastError) {
        return sendResponse({ error: chrome.runtime.lastError });
      }
      sendResponse({ status: 'success' });
    });
    return true;
  }

  if (request.type === 'logout') {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.error('Error al limpiar el almacenamiento:', chrome.runtime.lastError);
        sendResponse({ status: 'error', message: chrome.runtime.lastError });
      } else {
        console.log('Almacenamiento local limpiado correctamente.');
        sendResponse({ status: 'success' });
      }
    });

    // Retornar true para indicar que sendResponse se llamará de forma asíncrona
    return true;
    
  }

  chrome.storage.local.get('logged_in', (data) => {
    console.log(data);
  });
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.local.clear();
  }
});
