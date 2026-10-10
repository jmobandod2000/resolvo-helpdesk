import { ref } from 'vue';
import { LocalStorage } from 'quasar';

import type { RequesterProfile, SavedPortalTicket } from '../interfaces/portal';

const PROFILE_KEY = 'portalRequester';
const TICKETS_KEY = 'portalTickets';
const MAX_SAVED_TICKETS = 20;

const read = <T>(key: string, fallback: T): T => {
  try {
    return (LocalStorage.getItem(key) as T | null) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    LocalStorage.set(key, value);
  } catch {
    return;
  }
};

const remove = (key: string) => {
  try {
    LocalStorage.remove(key);
  } catch {
    return;
  }
};

const savedTickets = ref<SavedPortalTicket[]>(read<SavedPortalTicket[]>(TICKETS_KEY, []));

const usePortalStorage = () => {
  const loadProfile = () => read<RequesterProfile | null>(PROFILE_KEY, null);

  const saveProfile = (profile: RequesterProfile) => write(PROFILE_KEY, profile);

  const saveTicket = (ticket: SavedPortalTicket) => {
    savedTickets.value = [
      ticket,
      ...savedTickets.value.filter((item) => item.token !== ticket.token),
    ].slice(0, MAX_SAVED_TICKETS);
    write(TICKETS_KEY, savedTickets.value);
  };

  const forgetDevice = () => {
    savedTickets.value = [];
    remove(TICKETS_KEY);
    remove(PROFILE_KEY);
  };

  return { savedTickets, loadProfile, saveProfile, saveTicket, forgetDevice };
};

export default usePortalStorage;
