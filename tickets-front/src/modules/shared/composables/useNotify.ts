import { Notify } from 'quasar';
import { i18n } from 'src/i18n';

const useNotify = () => {
  const successNotify = (message: string, timeout = 2500) => {
    Notify.create({ message, color: 'positive', position: 'bottom', timeout });
  };

  const infoNotify = (message: string, timeout = 2500) => {
    Notify.create({ message, color: 'primary', position: 'bottom', timeout });
  };

  const errorNotify = (message: string, timeout = 5000) => {
    Notify.create({
      message,
      color: 'negative',
      position: 'bottom',
      timeout,
      actions: [{ label: i18n.global.t('common.close'), color: 'white' }],
    });
  };

  return { successNotify, infoNotify, errorNotify };
};

export default useNotify;
