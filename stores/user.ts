import create from 'zustand';

type UserStore = {
    user: User;
    setUsername: (username: string) => void;
};

const useUserStore = create<UserStore>((set) => ({
    user: {
        id: '',
        userName: '',
    },
    setUsername: (userName) => set({
        user: {
            id: Math.random().toString(36).substring(7),
            userName: userName,
        }
    }),
}));

export default useUserStore;