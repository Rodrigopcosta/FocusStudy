// __mocks__/supabase.ts
export const createClient = () => ({
  auth: {
    signUp: jest.fn().mockResolvedValue({ error: null }), // simula cadastro OK
    signInWithOAuth: jest.fn().mockResolvedValue({ error: null }), // simula login Google OK
  },
})
