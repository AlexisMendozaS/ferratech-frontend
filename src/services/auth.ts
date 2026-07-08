import client from '@/api/client'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/** Envía el id_token de Google al backend y recibe nuestro JWT propio */
export async function loginWithGoogle(idToken: string): Promise<string> {
  const { data } = await client.post<TokenResponse>('/auth/google', {
    id_token: idToken,
  })
  return data.access_token
}
