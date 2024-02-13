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

  if (request.type === 'updateprojectFilters') {
    chrome.storage.local.set({ projectFilters: request.projectFilters }, () => {
      console.log(
        'Datos guardados en el almacenamiento local. ' + request.projectFilters
      );
    });
  }

  if (request.type === 'updateusersFiltersStudent') {
    chrome.storage.local.set(
      { usersFiltersStudent: request.usersFiltersStudent },
      () => {
        console.log(
          'Datos guardados en el almacenamiento local. ' +
            request.usersFiltersStudent
        );
      }
    );
  }

  if (request.type === 'updateusersFilters') {
    chrome.storage.local.set({ usersFilters: request.usersFilters }, () => {
      console.log(
        'Datos guardados en el almacenamiento local. ' + request.usersFilters
      );
    });
  }

  if (request.type === 'logout') {
    chrome.storage.local.remove('projectFilters', () => {});
    chrome.storage.local.remove('usersFiltersStudent', () => {});
    chrome.storage.local.remove('usersFilters', () => {});
    chrome.storage.local.remove('extensionTabs', () => {});
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
