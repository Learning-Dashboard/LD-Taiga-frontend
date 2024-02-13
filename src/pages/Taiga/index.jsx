import React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './Index.module.css';
import Metrics from '../../Components/Metrics';
import CryptoJS from 'crypto-js';

function injectReactComponent() {
  if (
    window.location.href.match(
      /^https:\/\/tree.taiga.io\/project\/.*\/timeline$/
    )
  ) {
    // Check if the React container already exists in the DOM
    // Check if the React container already exists in the DOM
    if (document.querySelector('#my-react-container') != null) {
      return;
    }
  }

  const singleProjectIntro = document.querySelector('.single-project-intro');
  if (singleProjectIntro != null) {
    const elementoX = singleProjectIntro.parentNode;
    const reactContainer = document.createElement('div');
    reactContainer.setAttribute('id', 'my-react-container');
    ReactDOM.render(React.createElement(App), reactContainer);
    elementoX.insertAdjacentElement('afterend', reactContainer);
  }
}

const k = 'TFG-2023-Crypto-projects';

const singleProjectIntro = document.querySelector('.single-project-intro');
if (singleProjectIntro != null) {
  injectReactComponent();
}

const observer = new MutationObserver(function (mutationsList, observer) {
  if (document.querySelector('.single-project-intro') != null) {
    injectReactComponent();
    return;
  }
});

observer.observe(document.body, { childList: true, subtree: true });

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [proyecto, setProyecto] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await new Promise((resolve) => {
        chrome.storage.local.get(['logged_in', 'proyecto_actual'], (data) => {
          resolve(data);
        });
      });

      setIsLogged(data.logged_in);
      if (data.proyecto_actual) {
        const bytes = CryptoJS.AES.decrypt(data.proyecto_actual, k);
        const decryptedProject = bytes.toString(CryptoJS.enc.Utf8);
        setProyecto(decryptedProject);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      {isLogged && proyecto ? (
        <div className={styles.containerMetrics}>
          <Metrics proyecto={proyecto} />
        </div>
      ) : (
        <div className={styles.containerLogInMessage}>
          <div className={styles.logInMessage}>
            <h1>
              Please log in to the extension's pop-up to view the metrics of
              your project.
            </h1>
          </div>
        </div>
      )}
    </div>
  );
}
