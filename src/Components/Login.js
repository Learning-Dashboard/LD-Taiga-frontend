import React from 'react';
import { useState, useEffect } from 'react';
import './Login.css';
import Qrapids from '../assets/img/qrapids.png';
import ReactLoading from 'react-loading';
import CryptoJS from 'crypto-js';

const Login = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [proyecto, setProyecto] = useState();
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('logged_in', (data) => {
      setIsLoggedIn(data.logged_in);
    });

    chrome.storage.local.get('proyecto_actual', (data) => {
      if (data.proyecto_actual) {
        const bytes = CryptoJS.AES.decrypt(data.proyecto_actual, k);
        const decryptedProject = bytes.toString(CryptoJS.enc.Utf8);
        setProyecto(decryptedProject);
      }
    });
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    // Aquí llamarías a tu backend para autenticar al usuario
    // Si el usuario es autenticado con éxito, establecerías isLoggedIn a true
    try {
      const response = await fetch('https://proxy-tfg.vercel.app/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        //if (username === 'pes11a' && password === 'a') {
        setIsLoggedIn(true);
        setProyecto(username);
        setLoading(false);
        setErrorMessage('');
        const encryptedProject = CryptoJS.AES.encrypt(username, k).toString();
        // Guarda la clave "logged_in" en el almacenamiento local
        chrome.storage.local.set(
          { logged_in: true, proyecto_actual: encryptedProject },
          () => {
            chrome.runtime.sendMessage({
              type: 'updateLocalStorage',
              logged_in: true,
              proyecto_actual: encryptedProject,
            });
          }
        );

        chrome.tabs.query(
          { url: 'https://tree.taiga.io/project/*/timeline' },
          function (tabs) {
            if (tabs.length > 0) {
              // Se encontró la pestaña
              chrome.tabs.reload(tabs[0].id);
            } else {
              // La pestaña no está abierta
              // Puedes abrir la pestaña usando chrome.tabs.create
            }
          }
        );
      } else {
        // mostrar error de autenticación
        const data = await response.json();
        setErrorMessage(data.error);
        console.log('aaaaa');
        setLoading(false);
      }
      clearForm();
    } catch (error) {
      console.error(error);
      setErrorMessage('server error');
      setLoading(false);
      //setErrorMessage('Ha ocurrido un error');
    }
  };
  const k = 'TFG-2023-Crypto-projects';
  const handleLogout = () => {
    // Establece isLoggedIn a false
    setIsLoggedIn(false);
    setProyecto('');
    // Elimina la clave "logged_in" del almacenamiento local
    chrome.storage.local.set(
      { logged_in: false, proyecto_actual: null },
      () => {
        chrome.runtime.sendMessage({
          type: 'updateLocalStorage',
          logged_in: false,
          proyecto_actual: null,
        });
      }
    );
    chrome.runtime.sendMessage({
      type: 'logout',
    });
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
  };

  const handleAboutClick = () => {
    setShowAbout(true);
  };

  const handleBackClick = () => {
    setShowAbout(false);
  };

  return (
    <div>
      {isLoggedIn && proyecto ? (
        <div className="centered-container">
          {showAbout ? (
            <div className="about-container">
              <div className="back">
                <button onClick={handleBackClick}>{'<'}</button>
              </div>
              <div className="text-about">
                <p>Welcome to Taiga Metrics!</p>
                <p>
                  This extension was developed as part of Gerard Álvarez's
                  Treball de Final de Grau (TFG) to improve project management
                  in Taiga. It provides additional metrics and visualizations
                  for better progress tracking.
                </p>
                <p>
                  For more information and access to the source code, visit:
                </p>
                <a href="https://github.com/gerardalvarez/Taiga_metrics-extension">
                  GitHub repository
                </a>
                <p>To see the complete metrics, visit:</p>
                <a href="http://gessi-dashboard.essi.upc.edu:8888/">
                  Learning Dashboard
                </a>
                <div style={{ marginTop: '60px' }}>
                  <p>
                    <em>
                      Note: The Taiga Metrics extension is a prototype in
                      development and may be subject to updates and improvements
                      in the future.
                    </em>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="logged-container">
              <img alt="img" src={Qrapids} className="img" />
              <div className="pp">
                <p>Showing project : {proyecto}</p>
              </div>
              <div className="pp">
                <p>If nothing is showed in the /timeline, reload the page</p>
              </div>
              <div className="but2">
                <button onClick={handleLogout}>Log Out</button>
              </div>
              <div>
                <p className="about" onClick={handleAboutClick}>
                  About
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bar"></div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="title">Log In | QRapids</div>
              <div className="user">
                <label htmlFor="username">Username </label>
                <input
                  className="user-input"
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="pswd">
                <label htmlFor="password">Password </label>
                <input
                  className="pswd-input"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errorMessage && (
                <div style={{ color: 'red', marginTop: 20 }}>
                  {errorMessage}
                </div>
              )}
              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    margin: '5px',
                  }}
                >
                  <ReactLoading
                    type="bubbles"
                    color="#008aa8"
                    height={'20%'}
                    width={'20%'}
                  />
                </div>
              ) : (
                <button className="button" type="submit">
                  Log In
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
