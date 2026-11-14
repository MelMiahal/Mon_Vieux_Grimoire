import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

function NotFound() {
  return (
    <main className={`${styles.NotFound} content-container`}>
      <p className={styles.Code}>404</p>
      <h1>Page introuvable</h1>
      <p>La page que vous recherchez n’existe pas ou a été déplacée.</p>
      <Link to="/" className="button">Retour à l’accueil</Link>
    </main>
  );
}

export default NotFound;
