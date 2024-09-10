import { useAuth0 } from "@auth0/auth0-react"
import { Client, fql } from 'fauna';

export const useFaunaQuery = () => {
  const { getAccessTokenSilently } = useAuth0()
  const execQuery = async (queryFunction: (faunaClient: Client, faunaQuery: typeof fql, ...params: any) => Promise<any>, ...queryParams: any) => {
    try {
      const token = await getAccessTokenSilently()
      const client = new Client({secret: token})
      return queryFunction(client, fql, ...queryParams)
    } catch (error) {
      console.log(error)
      return null
    }
  }
  return { execQuery }
}
