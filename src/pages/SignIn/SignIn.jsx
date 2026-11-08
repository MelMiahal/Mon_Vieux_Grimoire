import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { API_ROUTES } from '../../utils/constants';
import { useUser } from '../../lib/customHooks';
import { storeInLocalStorage } from '../../lib/common';
import { ReactComponent as Logo } from '../../images/Logo.svg';
import styles from './SignIn.module.css';

function getFrenchErrorMessage(error) {
  const apiMessage = error.response?.data?.error;
  const translatedMessages = {
    'Email and password are required': 'Veuillez saisir votre adresse e-mail et votre mot de passe.',
    'Invalid email or password': 'Adresse e-mail ou mot de passe incorrect.',
    'Authentication required': 'Veuillez vous connecter pour continuer.',
    'Invalid authentication token': 'Votre session est invalide. Veuillez vous reconnecter.',
  };

  if (apiMessage) {
    if (translatedMessages[apiMessage]) {
      return translatedMessages[apiMessage];
    }

    if (/email.*unique|unique.*email/i.test(apiMessage)) {
      return 'Cette adresse e-mail est déjà utilisée.';
    }

    if (apiMessage.startsWith('ValidationError') || apiMessage.startsWith('CastError')) {
      return 'Les informations fournies sont invalides.';
    }
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const { connectedUser, auth, userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && connectedUser && auth) {
      navigate('/');
    }
  }, [auth, connectedUser, navigate, userLoading]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formKey, setFormKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const clearCredentials = () => {
    setEmail('');
    setPassword('');
    setFormKey((currentKey) => currentKey + 1);
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: 'post',
        url: API_ROUTES.SIGN_IN,
        data: {
          email,
          password,
        },
      });
      if (!response?.data?.token) {
        setNotification({ error: true, message: 'Une erreur est survenue' });
        console.log('Something went wrong during signing in: ', response);
      } else {
        storeInLocalStorage(response.data.token, response.data.userId);
        clearCredentials();
        setUser(response.data);
        navigate('/');
      }
    } catch (err) {
      console.log(err);
      setNotification({
        error: true,
        message: getFrenchErrorMessage(err),
      });
      console.log('Some error occured during signing in: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: 'POST',
        url: API_ROUTES.SIGN_UP,
        data: {
          email,
          password,
        },
      });
      if (!response?.data) {
        setNotification({ error: true, message: 'La création du compte a échoué. Veuillez réessayer.' });
        return;
      }
      clearCredentials();
      setNotification({ error: false, message: 'Votre compte a bien été créé, vous pouvez vous connecter.' });
    } catch (err) {
      setNotification({
        error: true,
        message: getFrenchErrorMessage(err),
      });
      console.log('Some error occured during signing up: ', err);
    } finally {
      setIsLoading(false);
    }
  };
  const errorClass = notification.error ? styles.Error : null;
  return (
    <div className={`${styles.SignIn} container`}>
      <Logo />
      <div className={`${styles.Notification} ${errorClass}`}>
        {notification.message.length > 0 && <p>{notification.message}</p>}
      </div>
      <div className={styles.Form}>
        <label htmlFor="email">
          <p>Adresse email</p>
          <input
            className=""
            type="text"
            name="email"
            id="email"
            key={`email-${formKey}`}
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setNotification({ error: false, message: '' });
            }}
          />
        </label>
        <label htmlFor="password">
          <p>Mot de passe</p>
          <input
            className="border-2 outline-none p-2 rounded-md"
            type="password"
            name="password"
            id="password"
            key={`password-${formKey}`}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setNotification({ error: false, message: '' });
            }}
          />
        </label>
        <div className={styles.Submit}>
          <button
            type="submit"
            className="
            flex justify-center
            p-2 rounded-md w-1/2 self-center
            bg-gray-800  text-white hover:bg-gray-800"
            onClick={signIn}
          >
            {isLoading ? <div className="" /> : null}
            <span>
              Se connecter
            </span>
          </button>
          <span>OU</span>
          <button
            type="submit"
            className="
            flex justify-center
            p-2 rounded-md w-1/2 self-center
            bg-gray-800  text-white hover:bg-gray-800"
            onClick={signUp}
          >
            {
                isLoading
                  ? <div className="mr-2 w-5 h-5 border-l-2 rounded-full animate-spin" /> : null
              }
            <span>
              {'S\'inscrire'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

SignIn.propTypes = {
  setUser: PropTypes.func.isRequired,
};
export default SignIn;
