import { authenticate, AuthOptions, FinishedData } from './auth';
import { defineCustomElements } from '@blockstack/connect-ui';

export const showBlockstackConnect = (authOptions: AuthOptions) => {
  defineCustomElements();
  const element = document.createElement('connect-modal');
  element.authOptions = authOptions;
  document.body.appendChild(element);
  const finishedWrapper = (finishedData: FinishedData) => {
    element.remove();
    const callback = authOptions.onFinish || authOptions.finished;
    if (callback) {
      callback(finishedData);
    }
  };
  element.addEventListener('signUp', () => {
    authenticate({
      ...authOptions,
      sendToSignIn: false,
      onFinish: finishedWrapper,
    });
  });
  element.addEventListener('signIn', () => {
    authenticate({
      ...authOptions,
      sendToSignIn: true,
      onFinish: finishedWrapper,
    });
  });
  const handleEsc = function (ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      document.removeEventListener('keydown', handleEsc);
      element.remove();
    }
  };
  element.addEventListener('closeModal', () => {
    document.removeEventListener('keydown', handleEsc);
    element.remove();
  });
  document.addEventListener('keydown', handleEsc);
};