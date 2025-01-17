import {Client} from "../clients/types";

export type Debtor = {
  id: number
  name: string
  surname: string
  patronymic: string
  debt: number
  balance: number
  registrationAmount: number
  productDescription: string
  note: string
  status: string
  client: Client
}
