import { ref, watch } from 'vue';
import type { QForm } from 'quasar';
import { useI18n } from 'vue-i18n';

const useLocaleAwareForm = () => {
  const { locale } = useI18n();
  const formRef = ref<QForm | null>(null);

  watch(locale, () => formRef.value?.resetValidation());

  return formRef;
};

export default useLocaleAwareForm;
